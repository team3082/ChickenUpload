import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDShBwN6mChQt9P0PdKxsOR5HG_Uq172nI",
  authDomain: "chickenscout-21e32.firebaseapp.com",
  databaseURL: "https://chickenscout-21e32-default-rtdb.firebaseio.com",
  projectId: "chickenscout-21e32",
  storageBucket: "chickenscout-21e32.firebasestorage.app",
  messagingSenderId: "177473839950",
  appId: "1:177473839950:web:22a232d21ad941cc1c341f",
  measurementId: "G-BMHHNB3SZ2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to wait for DOM to be ready
function domReady(callback) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(callback, 500);
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

// Validate and parse scanned data
function parseScannedData(data) {
  try {
    const parsedData = JSON.parse(data);

    if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
      throw new Error("Invalid data format.");
    }

    return parsedData;
  } catch (error) {
    throw new Error("Data parsing failed: " + error.message);
  }
}

// Check if the data contains a "drivetrain" field
function hasDrivetrain(data) {
  return data.hasOwnProperty("drivetrain");
}

// Save data to Firestore
async function saveToFirestore(collectionName, docId, data) {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data);
}

// Process scanned QR code data
async function processScannedData(data, scanner) {
  try {
    const parsedData = parseScannedData(data);

    const { doc_ID, ...docData } = parsedData;

    if (!doc_ID) {
      throw new Error("Missing 'doc_ID' field.");
    }

    // Determine the collection based on the presence of "drivetrain"
    const collectionName = hasDrivetrain(parsedData) ? "10kPits" : "10kMatches";

    // Save data to the appropriate collection
    await saveToFirestore(collectionName, doc_ID, docData);

    alert(`Data sent successfully to ${collectionName}!`);
    setTimeout(() => scanner.resume(), 500); // Resume scanning after .5 second
  } catch (error) {
    console.error("Error processing scanned data:", error);
    alert(`Error: ${error.message} Please find Emilio.`);
    setTimeout(() => scanner.resume(), 500); // Resume scanning after .5 second
  }
}

// Initialize QR Code Scanner
function initializeScanner() {
  const scanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 10,
    qrbox: 250,
  });

  const onScanSuccess = (decodeText) => {
    scanner.pause();
    processScannedData(decodeText, scanner);
  };

  scanner.render(onScanSuccess);
}

// Entry Point
domReady(() => {
  initializeScanner();
});