import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

const goals = () => collection(db, 'goals');
const contributions = () => collection(db, 'goalContributions');
const fromDoc = (item) => ({ id: item.id, ...item.data() });

export async function listGoals(workspaceId) {
  if (!workspaceId) return [];
  const snapshot = await getDocs(query(goals(), where('workspace', '==', workspaceId)));
  return snapshot.docs.map(fromDoc);
}

export async function createGoal(workspaceId, input) {
  if (!workspaceId) throw new Error('A workspace is required.');
  const reference = await addDoc(goals(), { ...input, workspace: workspaceId, createdBy: auth?.currentUser?.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id: reference.id };
}

export async function updateGoal(id, input) {
  if (!id) throw new Error('A goal is required.');
  await updateDoc(doc(db, 'goals', id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteGoal(id) {
  if (!id) throw new Error('A goal is required.');
  await deleteDoc(doc(db, 'goals', id));
}

export async function listContributions(workspaceId, goalId) {
  if (!workspaceId) return [];
  const constraints = [where('workspace', '==', workspaceId)];
  if (goalId) constraints.push(where('goalId', '==', goalId));
  const snapshot = await getDocs(query(contributions(), ...constraints));
  return snapshot.docs.map(fromDoc);
}

export async function addContribution(workspaceId, goalId, input) {
  if (!workspaceId || !goalId) throw new Error('A workspace and goal are required.');
  const reference = await addDoc(contributions(), { ...input, workspace: workspaceId, goalId, createdBy: auth?.currentUser?.uid, createdAt: serverTimestamp() });
  return { id: reference.id };
}
