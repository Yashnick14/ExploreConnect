import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // ✅ Load from Render env variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Fix private_key newlines if needed
    if (serviceAccount.private_key?.includes("\\n")) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n"
      );
    }
  } catch (err) {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT env var: " + err.message);
  }
} else {
  // ✅ Fallback to local JSON file (for local dev)
  const serviceAccountPath = path.resolve(
    "./backend/firebaseServiceAccount.json"
  );
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      "Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT env var or add backend/firebaseServiceAccount.json"
    );
  }
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
