import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

const records = () => collection(db, 'budgets');
const fromDoc = (item) => ({ id: item.id, ...item.data() });

export async function listBudgets(workspaceId) {
  if (!workspaceId) return [];
  const snapshot = await getDocs(query(records(), where('workspace', '==', workspaceId)));
  return snapshot.docs.map(fromDoc);
}

export async function createBudget(workspaceId, input) {
  if (!workspaceId) throw new Error('A workspace is required.');
  const reference = await addDoc(records(), { ...input, workspace: workspaceId, createdBy: auth?.currentUser?.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id: reference.id };
}

export async function updateBudget(id, input) {
  if (!id) throw new Error('A budget is required.');
  await updateDoc(doc(db, 'budgets', id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteBudget(id) {
  if (!id) throw new Error('A budget is required.');
  await deleteDoc(doc(db, 'budgets', id));
}
