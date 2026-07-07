import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  TrendingUp, 
  Link as LinkIcon,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock
} from 'lucide-react';
import { BankAccount, Transaction } from '../types';

export default function WealthView() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for manual transactions
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('general');
  const [isDeposit, setIsDeposit] = useState(false);

  // Form states for manual accounts
  const [instName, setInstName] = useState('');
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accType, setAccType] = useState<'checking' | 'savings' | 'investment' | 'credit'>('checking');
  const [accNumber, setAccNumber] = useState('');

  const fetchWealthData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wealth');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setTransactions(data.transactions || []);
      
      const total = (data.accounts || []).reduce((acc: number, item: BankAccount) => acc + item.balance, 0);
      setTotalBalance(total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWealthData();
  }, []);

  useEffect(() => {
    const handleTrigger = () => {
      if (localStorage.getItem('maestro-trigger-link-account') === 'true') {
        localStorage.removeItem('maestro-trigger-link-account');
        setIsLinking(true);
        setTimeout(() => {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }, 100);
      }
    };
    handleTrigger();
    const interval = setInterval(handleTrigger, 400);
    return () => clearInterval(interval);
  }, []);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !accName || !accBalance) return;

    try {
      const balanceVal = parseFloat(accBalance) * (accType === 'credit' ? -1 : 1);
      const res = await fetch('/api/wealth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution: instName,
          name: accName,
          balance: balanceVal,
          type: accType,
          account_number: accNumber || `**** ${Math.floor(1000 + Math.random() * 9000)}`
        })
      });
      if (res.ok) {
        setInstName('');
        setAccName('');
        setAccBalance('');
        setAccNumber('');
        setIsLinking(false);
        fetchWealthData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount || !merchant) return;

    try {
      const amountVal = parseFloat(amount) * (isDeposit ? 1 : -1);
      const res = await fetch('/api/wealth/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: parseInt(accountId),
          date: new Date().toISOString().split('T')[0],
          merchant,
          amount: amountVal,
          category
        })
      });
      if (res.ok) {
        setAmount('');
        setMerchant('');
        fetchWealthData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">Wealth & Portfolio Oversight</h2>
          <p className="text-zinc-400 text-sm">Monitor private banking nodes, trust distributions, and Lakeside premium balances.</p>
        </div>
        
        <button 
          onClick={() => setIsLinking(!isLinking)}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
        >
          <LinkIcon className="w-4 h-4" />
          Link Security Account
        </button>
      </div>

      {/* Account linking form (Modal replacement) */}
      {isLinking && (
        <form onSubmit={handleLinkAccount} className="p-6 bg-[#0F0F0F] border border-yellow-500/10 rounded-2xl space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-mono font-bold text-yellow-400 tracking-widest uppercase">Link New Private Custody Account</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Institution Name</label>
              <input 
                type="text" 
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                placeholder="e.g. Goldman Sachs"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Account Nickname</label>
              <input 
                type="text" 
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="e.g. Master Trust Account"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Initial Asset Value ($)</label>
              <input 
                type="number" 
                value={accBalance}
                onChange={(e) => setAccBalance(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Asset Type</label>
              <select 
                value={accType}
                onChange={(e) => setAccType(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="checking">Private Checking</option>
                <option value="savings">High-Yield Savings</option>
                <option value="investment">Wealth Management</option>
                <option value="credit">Credit Facilities</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Account Suffix</label>
              <input 
                type="text" 
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
                placeholder="e.g. **** 1024"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setIsLinking(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold rounded-xl"
            >
              Verify & Link Account
            </button>
          </div>
        </form>
      )}

      {/* Main Stats Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">CONSOLIDATED ASSETS</span>
            <span className="text-3xl font-mono font-bold tracking-tight text-yellow-400">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Global Ledger Verified</span>
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
        </div>

        {/* Dynamic linked account nodes list */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-5 bg-zinc-950 border border-white/5 rounded-xl hover:border-white/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-white/5 uppercase">
                    {acc.institution}
                  </span>
                  <Building2 className="w-4 h-4 text-zinc-600" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">{acc.name}</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">No. {acc.account_number}</p>
              </div>
              <p className="text-lg font-mono font-bold text-white mt-4">
                ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid below: Ledger Book & Add Quick Transaction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-zinc-200">Global Sweep Audit Trail</h3>
            <span className="text-xs text-zinc-500">{transactions.length} Clearances Recorded</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-center justify-between hover:bg-[#131313] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.amount > 0 ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{tx.merchant}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{tx.date} — {tx.category.toUpperCase()}</p>
                  </div>
                </div>
                <span className={`text-sm font-mono font-bold ${tx.amount > 0 ? 'text-yellow-400' : 'text-zinc-200'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Transaction nodes */}
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-4 h-fit">
          <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase font-mono">Log Transaction Node</h3>
          
          <form onSubmit={handleAddTransaction} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Source Custody Node</label>
              <select 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                required
              >
                <option value="">Select Connected Account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.institution} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => setIsDeposit(false)}
                className={`py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${!isDeposit ? 'bg-zinc-900 text-white border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Expense Clearance
              </button>
              <button 
                type="button"
                onClick={() => setIsDeposit(true)}
                className={`py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${isDeposit ? 'bg-yellow-400 text-black font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Asset deposit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Amount ($)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="240.00"
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="golf">Golf fee</option>
                  <option value="family">Family oversight</option>
                  <option value="investment">Private trust investment</option>
                  <option value="luxury">Luxury clearance</option>
                  <option value="service">Utility sync</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Recipient / Merchant</label>
              <input 
                type="text" 
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Lakeside Pro Shop, SmartVault..."
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Verify Ledger Entry
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
