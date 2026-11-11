const {setGlobalOptions} = require("firebase-functions");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// App band hone par ya background me notification bhejne ke liye trigger
const db = admin.firestore();

exports.sendPushNotification = functions.firestore
  .document("schools/{schoolId}/notifications/{notifId}")
  .onCreate(async (snap, context) => {
    const notifData = snap.data();
    const schoolId = context.params.schoolId;

    try {
      const tokensSnapshot = await db
        .collection("schools")
        .doc(schoolId)
        .collection("fcmTokens")
        .get();

      if (tokensSnapshot.empty) {
        console.log("Koi FCM token nahi mila.");
        return null;
      }

      const tokens = [];
      tokensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          tokens.push(data.token);
        }
      });

      if (tokens.length === 0) return null;

      const payload = {
        notification: {
          title: notifData.title || "RBIC School Notice",
          body: notifData.body || "Aapke liye naya update aaya hai.",
          icon: "/logo.png"
        },
        data: {
          url: "/portal.html#notifications"
        }
      };

      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log("Notifications successfully sent:", response);
      return null;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  });