import React, { useEffect, useMemo, useState } from 'react'
import { Spline } from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { auth, db } from './firebase'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth'
import { 
  doc, setDoc, serverTimestamp, getDoc, 
  collection, addDoc, onSnapshot, query, orderBy, where
} from 'firebase/firestore'
import { Heart, Plus, LogOut, Moon, Sun, ArrowRight, PieChart, Wallet, Settings } from 'lucide-react'

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { user, loading }
}

function Landing() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0b0712] dark:via-[#0f0a18] dark:to-[#140d22] text-gray-800 dark:text-gray-100">
      <header className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/90 text-white"><Heart size={18}/></span>
          Couple Tracker
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/pricing" className="px-3 py-2 rounded-md hover:bg-pink-100/60 dark:hover:bg-white/10">Premium</Link>
          <Link to="/app" className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-500">Open App</Link>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
        <div className="py-8">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Share expenses, stay in sync, and keep it fair.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            A minimal, cute expense tracker for couples. Real-time sync, auto-split, and delightful micro-animations.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">
              <Wallet size={18}/> Start Tracking
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-pink-300 hover:bg-pink-50 dark:hover:bg-white/10">
              <PieChart size={18}/> See Premium
            </Link>
          </div>
        </div>
        <div className="h-[420px] rounded-2xl overflow-hidden ring-1 ring-pink-200/60 dark:ring-white/10">
          <Spline scene="https://prod.spline.design/8nsoLg1te84JZcE9/scene.splinecode" />
        </div>
      </main>
      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500">
        Built with love for modern couples.
      </footer>
    </div>
  )
}

function AuthGate({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user])
  if (loading) return <div className="h-[60vh] grid place-items-center">Loading…</div>
  return <>{children}</>
}

function Login() {
  const navigate = useNavigate()
  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const res = await signInWithPopup(auth, provider)
    const u = res.user
    const userRef = doc(db, 'users', u.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        name: u.displayName || '',
        email: u.email,
        photoUrl: u.photoURL || '',
        coupleId: null,
        createdAt: serverTimestamp(),
      })
    }
    navigate('/app')
  }
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-[#0b0712] dark:to-[#140d22]">
      <div className="w-full max-w-md bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-8 shadow-xl ring-1 ring-pink-200/60 dark:ring-white/10">
        <div className="flex items-center gap-2 font-extrabold text-xl mb-4 text-pink-600"><Heart size={18}/> Couple Tracker</div>
        <h2 className="text-2xl font-bold">Welcome</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Sign in to sync with your partner</p>
        <button onClick={signInGoogle} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">
          Continue with Google
        </button>
      </div>
    </div>
  )
}

function AppShell() {
  const { user } = useAuth()
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0b0712] dark:via-[#0f0a18] dark:to-[#140d22]">
      <header className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/90 text-white"><Heart size={16}/></span>
          Couple Tracker
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark((d) => !d)} className="px-3 py-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}    
          </button>
          {user && (
            <button onClick={() => signOut(auth)} className="px-3 py-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10 inline-flex items-center gap-2">
              <LogOut size={16}/> Logout
            </button>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 pb-12">
        <Dashboard />
      </main>
    </div>
  )
}

function useCoupleData(coupleId) {
  const [expenses, setExpenses] = useState([])
  useEffect(() => {
    if (!coupleId) return
    const q = query(collection(db, 'couples', coupleId, 'expenses'), orderBy('timestamp', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [coupleId])
  return { expenses }
}

function Dashboard() {
  const { user } = useAuth()
  const [coupleId, setCoupleId] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const { expenses } = useCoupleData(coupleId)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then((s) => {
      setCoupleId(s.data()?.coupleId || null)
    })
  }, [user])

  const totalMonth = useMemo(() => expenses.reduce((a, e) => a + (e.amount || 0), 0), [expenses])

  const addExpense = async () => {
    if (!coupleId) return alert('Join or create a couple first')
    const cents = Math.round(parseFloat(amount || '0') * 100)
    if (!cents || cents <= 0) return alert('Enter a valid amount')
    await addDoc(collection(db, 'couples', coupleId, 'expenses'), {
      amount: cents,
      category: 'general',
      paidBy: user.uid,
      note: note || '',
      emoji: '💞',
      timestamp: new Date(),
    })
    setAmount('')
    setNote('')
  }

  return (
    <div>
      {!coupleId ? (
        <EmptyCouple />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">This Month</h2>
                <div className="text-pink-600 font-semibold">${(totalMonth/100).toFixed(2)}</div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount" className="px-4 py-3 rounded-lg bg-white dark:bg-white/10 border border-pink-200/60 dark:border-white/10 outline-none"/>
                <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Note (optional)" className="px-4 py-3 rounded-lg bg-white dark:bg-white/10 border border-pink-200/60 dark:border-white/10 outline-none"/>
                <button onClick={addExpense} className="col-span-1 sm:col-span-2 inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">
                  <Plus size={18}/> Add expense
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
              <h3 className="font-semibold mb-3">Recent</h3>
              <div className="space-y-3">
                {expenses.map((e)=> (
                  <div key={e.id} className="flex items-center justify-between px-3 py-3 rounded-lg bg-white/70 dark:bg-white/5 ring-1 ring-pink-200/60 dark:ring-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{e.emoji || '💗'}</span>
                      <div>
                        <div className="font-medium">{e.note || 'Expense'}</div>
                        <div className="text-xs text-gray-500">{new Date(e.timestamp?.toDate ? e.timestamp.toDate() : e.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="font-semibold">${(e.amount/100).toFixed(2)}</div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-sm text-gray-500">No expenses yet.</div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
              <h3 className="font-semibold">Balance</h3>
              <p className="text-sm text-gray-500 mt-1">Auto-split and net balance updates via Cloud Functions.</p>
              <Link to="/pricing" className="mt-3 inline-flex items-center gap-1 text-pink-600 hover:underline">Upgrade for analytics <ArrowRight size={14}/></Link>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
              <h3 className="font-semibold">Tips</h3>
              <ul className="text-sm list-disc pl-4 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Create or join a couple from Settings</li>
                <li>Add emoji to personalize expenses</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyCouple() {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur p-8 ring-1 ring-pink-200/60 dark:ring-white/10 text-center">
      <h3 className="text-xl font-semibold">Link with your partner</h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2">Create a couple or join with a 6-digit code.</p>
      <button onClick={() => navigate('/settings')} className="mt-5 inline-flex items-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">
        <Settings size={18}/> Go to Settings
      </button>
    </div>
  )
}

function Pricing() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0b0712] dark:via-[#0f0a18] dark:to-[#140d22]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold">Premium</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Unlimited categories and goals, export PDF, custom themes, remove ads.</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-pink-200/60 dark:ring-white/10">
            <h3 className="text-xl font-bold">Monthly</h3>
            <div className="text-3xl font-extrabold mt-2">$1.49</div>
            <button className="mt-6 w-full bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">Start trial</button>
          </div>
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-white/10 ring-2 ring-pink-400">
            <h3 className="text-xl font-bold">Yearly</h3>
            <div className="text-3xl font-extrabold mt-2">$9.99</div>
            <button className="mt-6 w-full bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">Start trial</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)

  const createCouple = async () => {
    if (!user) return
    setCreating(true)
    try {
      // Simple join code client-side for demo; production should use Cloud Function
      const code = Math.floor(100000 + Math.random()*900000).toString()
      const coupleId = user.uid
      await setDoc(doc(db, 'couples', coupleId), {
        coupleId,
        partnerA: { uid: user.uid, name: user.displayName || 'You', photoUrl: user.photoURL || '' },
        partnerB: null,
        joinCode: code,
        createdAt: serverTimestamp(),
        status: { balance: 0, lastUpdated: serverTimestamp() }
      })
      await setDoc(doc(db, 'users', user.uid), { coupleId }, { merge: true })
      alert(`Couple created. Share code ${code}`)
    } finally {
      setCreating(false)
    }
  }

  const joinCouple = async () => {
    if (!user || !joinCode) return
    // query couple by joinCode
    const couplesCol = collection(db, 'couples')
    const q = query(couplesCol, where('joinCode', '==', joinCode))
    const unsub = onSnapshot(q, async (snap) => {
      unsub()
      if (snap.empty) return alert('Invalid code')
      const d = snap.docs[0]
      const c = d.data()
      if (c.partnerB && c.partnerB.uid && c.partnerB.uid !== user.uid) return alert('Code already used')
      await setDoc(doc(db, 'couples', d.id), {
        partnerB: { uid: user.uid, name: user.displayName || 'Partner', photoUrl: user.photoURL || '' }
      }, { merge: true })
      await setDoc(doc(db, 'users', user.uid), { coupleId: d.id }, { merge: true })
      alert('Joined!')
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white/70 dark:bg-white/5 p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
          <h3 className="font-semibold">Create Couple</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Generate a new code and link accounts.</p>
          <button disabled={creating} onClick={createCouple} className="mt-4 inline-flex items-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500 disabled:opacity-50">
            Create
          </button>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-white/5 p-5 ring-1 ring-pink-200/60 dark:ring-white/10">
          <h3 className="font-semibold">Join Couple</h3>
          <input value={joinCode} onChange={(e)=>setJoinCode(e.target.value)} placeholder="6-digit code" className="mt-3 w-full px-4 py-3 rounded-lg bg-white dark:bg-white/10 border border-pink-200/60 dark:border-white/10 outline-none"/>
          <button onClick={joinCouple} className="mt-3 inline-flex items-center gap-2 bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-500">
            Join
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/pricing" element={<Pricing/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/settings" element={<AuthGate><SettingsPage/></AuthGate>} />
        <Route path="/app" element={<AuthGate><AppShell/></AuthGate>} />
      </Routes>
    </BrowserRouter>
  )
}
