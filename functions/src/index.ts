import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()
const db = admin.firestore()

// Utility to compute monthly stats
function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { start, end }
}

export const recalcBalances = functions.region('us-central1').https.onCall(async (data, context) => {
  const { coupleId } = data || {}
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Auth required')
  if (!coupleId) throw new functions.https.HttpsError('invalid-argument', 'coupleId required')

  const coupleRef = db.collection('couples').doc(coupleId)
  const coupleSnap = await coupleRef.get()
  if (!coupleSnap.exists) throw new functions.https.HttpsError('not-found', 'Couple not found')

  const { start, end } = getMonthRange()
  const expensesSnap = await coupleRef
    .collection('expenses')
    .where('timestamp', '>=', start)
    .where('timestamp', '<', end)
    .get()

  let totals: Record<string, number> = {}
  let totalA = 0, totalB = 0
  expensesSnap.forEach((d) => {
    const e = d.data() as any
    const amt = e.amount || 0
    totals[e.paidBy] = (totals[e.paidBy] || 0) + amt
  })
  const c = coupleSnap.data() as any
  const a = c?.partnerA?.uid
  const b = c?.partnerB?.uid
  totalA = totals[a] || 0
  totalB = totals[b] || 0
  const netBalance = totalA - totalB // if > 0, A paid more

  await coupleRef.set({
    status: {
      totalA,
      totalB,
      netBalance,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }
  }, { merge: true })

  return { totalA, totalB, netBalance }
})

export const sendNotificationOnExpense = functions.region('us-central1').firestore
  .document('couples/{coupleId}/expenses/{expenseId}')
  .onCreate(async (snap, context) => {
    const { coupleId } = context.params
    const e = snap.data() as any

    // Trigger recalculation
    try {
      await exports.recalcBalances.run({ data: { coupleId } } as any)
    } catch (err) {
      console.error('recalc error', err)
    }

    // Optional: send FCM push (requires tokens stored under users/{uid}/fcmTokens)
    try {
      const coupleRef = db.collection('couples').doc(coupleId)
      const couple = (await coupleRef.get()).data() as any
      const uids = [couple?.partnerA?.uid, couple?.partnerB?.uid].filter(Boolean)
      const tokens: string[] = []
      for (const uid of uids) {
        const tokensSnap = await db.collection('users').doc(uid).collection('fcmTokens').get()
        tokensSnap.forEach((t) => tokens.push(t.id))
      }
      if (tokens.length > 0) {
        await admin.messaging().sendMulticast({
          tokens,
          notification: {
            title: 'New expense added',
            body: `${(e.amount/100).toFixed(2)} • ${e.note || 'Expense'}`
          }
        })
      }
    } catch (err) {
      console.error('FCM error', err)
    }
  })
