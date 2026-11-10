import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../lib/firebase';
import { normalizeDateString } from '../../lib/format/dates';
import { normalizeTransactionInput } from './transactionForm';

const transactionsCollection = () => collection(db, 'transactions');

function toFirestoreInput(input) {
  const normalized = normalizeTransactionInput(input);
  return {
    ...normalized,
    date: Timestamp.fromDate(new Date(`${normalized.date}T00:00:00.000Z`)),
  };
}

function fromFirestore(item) {
  const data = item.data();
  const date = normalizeDateString(data.date) || data.date;
  return { id: item.id, ...data, date: typeof date === 'string' ? date : normalizeDateString(date) };
}

export async function listTransactions(workspaceId, filters = {}) {
  if (!workspaceId) return [];
  const constraints = [where('workspace', '==', workspaceId)];
  if (filters.type) constraints.push(where('type', '==', filters.type));
  if (filters.category) constraints.push(where('category', '==', filters.category));
  const snapshot = await getDocs(query(transactionsCollection(), ...constraints));
  const search = String(filters.search || '').trim().toLowerCase();
  return snapshot.docs
    .map(fromFirestore)
    .filter((transaction) => !search
      || [transaction.category, transaction.note, transaction.type].some((value) => String(value || '').toLowerCase().includes(search)))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

export async function createTransaction(workspaceId, input) {
  if (!workspaceId) throw new Error('A workspace is required.');
  const reference = await addDoc(transactionsCollection(), {
    workspace: workspaceId,
    createdBy: auth?.currentUser?.uid,
    ...toFirestoreInput(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: reference.id };
}

export async function updateTransaction(id, input) {
  if (!id) throw new Error('A transaction is required.');
  await updateDoc(doc(db, 'transactions', id), {
    ...toFirestoreInput(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(id) {
  if (!id) throw new Error('A transaction is required.');
  await deleteDoc(doc(db, 'transactions', id));
}
