/**
 * Firebase Connection Test
 * Run this to verify your Firebase setup is working
 */

import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase Connection...')
    console.log('Firebase project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
    console.log('Firebase auth domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
    console.log('Database instance:', db)

    const accountsRef = collection(db, 'accounts')
    const vouchersRef = collection(db, 'vouchers')

    const [accountsSnapshot, vouchersSnapshot] = await Promise.all([
      getDocs(accountsRef),
      getDocs(vouchersRef),
    ])

    console.log('✅ Firebase Connection Successful!')
    console.log(`📋 Found ${accountsSnapshot.docs.length} documents in accounts collection`)
    console.log(`📋 Found ${vouchersSnapshot.docs.length} documents in vouchers collection`)

    if (accountsSnapshot.docs.length > 0) {
      console.log('📄 accounts docs:', accountsSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))
    }
    if (vouchersSnapshot.docs.length > 0) {
      console.log('📄 vouchers docs:', vouchersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))
    }

    return {
      accounts: accountsSnapshot.docs.length,
      vouchers: vouchersSnapshot.docs.length,
    }
  } catch (error) {
    console.error('❌ Firebase Connection Failed!')
    console.error('Error Details:', error)

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        console.error('💡 Fix: Update Firestore security rules')
      } else if (error.message.includes('API')) {
        console.error('💡 Fix: Enable Firestore API in Firebase Console')
      }
    }

    return false
  }
}

// Run this in browser console to test
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection
}
