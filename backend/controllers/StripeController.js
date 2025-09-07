// backend/controllers/stripeController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/UserModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------- Helper: add 1 month ----------------
function addOneMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ---------------- Helper: ensure customer ----------------
async function ensureStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName || undefined,
  });

  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

// ---------------- Controller Methods ----------------

// Create Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, plan = "monthly" } = req.body;
    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const customerId = await ensureStripeCustomer(user);

    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
    if (!priceId) return res.status(500).json({ error: "Missing Price ID" });

    const price = await stripe.prices.retrieve(priceId);
    if (price.type !== "recurring") {
      return res
        .status(400)
        .json({ error: `Price ${priceId} is not recurring` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/membership/cancel`,
      client_reference_id: user.uid,
      metadata: { uid: user.uid, plan },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    console.log(`✅ Checkout Session created for user: ${user.uid}`);
    return res.json({ url: session.url });
  } catch (err) {
    console.error("❌ create-checkout-session error:", err.message);
    return res.status(500).json({ error: "Stripe session error" });
  }
};

// Create Billing Portal Session
export const createPortalSession = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ uid: userId });
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/membership`,
    });

    console.log(`✅ Billing portal created for user: ${user.uid}`);
    return res.json({ url: portal.url });
  } catch (err) {
    console.error("❌ create-portal-session error:", err.message);
    return res.status(500).json({ error: "Portal error" });
  }
};

// Cancel Subscription
// backend/controllers/StripeController.js
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    // User can be found by Firebase UID or Mongo _id
    const user =
      (await User.findOne({ uid: userId })) || (await User.findById(userId));

    if (!user || !user.subscriptionId) {
      return res
        .status(404)
        .json({ success: false, message: "No active subscription found" });
    }

    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    user.subscriptionId = null;
    user.membership = {
      isMember: false,
      plan: null,
      currentPeriodEnd: null,
      points: user.membership.points || 0,
    };
    await user.save();

    console.log(`⚠️ Subscription cancelled for user: ${user.uid || user._id}`);
    return res.json({ success: true, message: "Subscription cancelled" });
  } catch (err) {
    console.error("❌ cancel-subscription error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel subscription" });
  }
};

// Get Session
export const getSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    return res.json(session);
  } catch (err) {
    console.error("❌ getSession error:", err.message);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

// Handle Stripe Webhooks
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const uid = session.client_reference_id;
        const subscriptionId = session.subscription;

        await User.findOneAndUpdate(
          { uid },
          {
            subscriptionId,
            membership: {
              isMember: true,
              plan: "monthly",
              currentPeriodEnd: addOneMonth(new Date()),
            },
          }
        );
        console.log(`✅ Subscription started for ${uid}`);
        break;
      }

      case "customer.subscription.created": {
        const sub = event.data.object;
        const isActive = ["active", "trialing"].includes(sub.status);

        await User.findOneAndUpdate(
          { stripeCustomerId: sub.customer },
          {
            subscriptionId: sub.id,
            membership: {
              isMember: isActive,
              plan: "monthly",
              currentPeriodEnd: addOneMonth(new Date(sub.start_date * 1000)),
            },
          }
        );
        console.log(`✅ Subscription created: ${sub.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        await User.findOneAndUpdate(
          { subscriptionId: invoice.subscription },
          {
            membership: {
              isMember: true,
              plan: "monthly",
              currentPeriodEnd: addOneMonth(new Date(invoice.created * 1000)),
            },
          }
        );
        console.log(`🔁 Subscription renewed: ${invoice.subscription}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;

        await User.findOneAndUpdate(
          { subscriptionId: sub.id },
          {
            subscriptionId: null,
            membership: {
              isMember: false,
              plan: null,
              currentPeriodEnd: null,
            },
          }
        );
        console.log(`⚠️ Subscription canceled: ${sub.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const isActive = ["active", "trialing"].includes(sub.status);

        await User.findOneAndUpdate(
          { subscriptionId: sub.id },
          {
            membership: {
              isMember: isActive,
              plan: "monthly",
              currentPeriodEnd: addOneMonth(new Date(sub.start_date * 1000)),
            },
          }
        );
        console.log(`🔄 Subscription ${sub.id} updated`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).send("Server error");
  }
};

// Get Stripe Revenue
export const getRevenue = async (req, res) => {
  try {
    const range = req.query.range || "monthly"; // default monthly

    // Fetch invoices from Stripe (last 30 days)
    const invoices = await stripe.invoices.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      },
    });

    const revenueData = invoices.data.map((inv) => ({
      amount: inv.amount_paid / 100, // cents -> dollars
      date: new Date(inv.created * 1000),
    }));

    let grouped = [];

    if (range === "weekly") {
      // Group by day of this week (Sun-Sat)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      grouped = Array.from({ length: 7 }, (_, d) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + d);
        const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
        return {
          name: dayName,
          value: revenueData
            .filter((r) => r.date.toDateString() === day.toDateString())
            .reduce((sum, r) => sum + r.amount, 0),
        };
      });
    } else if (range === "monthly") {
      // Group by week of this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const weeks = Math.ceil((now.getDate() + startOfMonth.getDay()) / 7);

      grouped = Array.from({ length: weeks }, (_, w) => {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(1 + w * 7);
        const weekEnd = new Date(startOfMonth);
        weekEnd.setDate(1 + (w + 1) * 7);

        return {
          name: `Week ${w + 1}`,
          value: revenueData
            .filter((r) => r.date >= weekStart && r.date < weekEnd)
            .reduce((sum, r) => sum + r.amount, 0),
        };
      });
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error("❌ getRevenue error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch revenue" });
  }
};
