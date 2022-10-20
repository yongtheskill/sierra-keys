const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

// On sign up.
exports.processSignUp = functions.auth.user().onCreate(async (user) => {
  // Check if user meets role criteria.
  if (user.email === 'yongee2003@gmail.com') {
    const customClaims = {
      access: true,
      admin: true,
    };

    try {
      // Set custom user claims on this newly created user.
      await getAuth().setCustomUserClaims(user.uid, customClaims);

      // Update real-time database to notify client to force refresh.
      const metadataRef = getDatabase().ref('metadata/' + user.uid);

      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      await metadataRef.set({ refreshTime: new Date().getTime() });
    } catch (error) {
      console.log(error);
    }
  } else {
    const customClaims = {
      access: false,
      admin: false,
    };

    try {
      // Set custom user claims on this newly created user.
      await getAuth().setCustomUserClaims(user.uid, customClaims);

      // Update real-time database to notify client to force refresh.
      const metadataRef = getDatabase().ref('metadata/' + user.uid);

      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      await metadataRef.set({ refreshTime: new Date().getTime() });
    } catch (error) {
      console.log(error);
    }
  }
});

//deleteCollection
exports.deleteKeyGroup = functions.https.onCall(async (data, request) => {
  if (!request.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  try {
    const db = getFirestore();
    await deleteCollection(db, '/keyGroups/' + data.groupId + '/keys', 20);
    await db.collection('/keyGroups').doc(data.groupId).delete();
  } catch (error) {
    throw new functions.https.HttpsError('failed-precondition', error);
  }
});

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

//list all users
exports.listAllUsers = functions.https.onCall(async (data, request) => {
  if (!request.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  try {
    const users = getAuth().listUsers();
    return users;
  } catch (error) {
    console.log(error);
    throw new functions.https.HttpsError('error', error);
  }
});

//delete user
exports.deleteUser = functions.https.onCall(async (data, request) => {
  if (!request.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  getAuth()
    .deleteUser(data.uid)
    .then(() => {
      console.log('Successfully deleted user');
    })
    .catch((error) => {
      console.log('Error deleting user:', error);
      throw new functions.https.HttpsError('error', error);
    });
});

//create user
exports.newUser = functions.https.onCall(async (data, request) => {
  if (!request.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  getAuth()
    .createUser({
      email: data.email,
      password: data.password,
    })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.uid);
    })
    .catch((error) => {
      console.log('Error creating new user:', error);
      throw new functions.https.HttpsError('error', error);
    });
});

//change user role
exports.alterRole = functions.https.onCall(async (data, request) => {
  if (!request.auth.token.admin) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
  const customClaims = {
    access: false,
    admin: false,
  };

  if (data.role === 'admin') {
    customClaims.access = true;
    customClaims.admin = true;
  }
  if (data.role === 'user') {
    customClaims.access = true;
    customClaims.admin = false;
  }

  try {
    await getAuth().setCustomUserClaims(data.uid, customClaims);

    const metadataRef = getDatabase().ref('metadata/' + user.uid);
    await metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.log(error);
  }
});
