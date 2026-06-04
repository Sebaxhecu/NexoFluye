import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type DailySale = {
  date: string; // YYYY-MM-DD
  amount: number;
  profitPercent: number;
  profit: number;
  notes: string;
};

const KEYS = {
  users: 'nf:users',
  currentUser: 'nf:currentUser',
  sales: (userId: string) => `nf:sales:${userId}`,
};

// --- Auth ---

export async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const users = await getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Ya existe una cuenta con este correo.');
  }
  const user: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEYS.users, JSON.stringify([...users, { ...user, password }]));
  await AsyncStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const users: (User & { password: string })[] = JSON.parse(
    (await AsyncStorage.getItem(KEYS.users)) || '[]'
  );
  const match = users.find(
    u => u.email === email.toLowerCase() && u.password === password
  );
  if (!match) throw new Error('Correo o contraseña incorrectos.');
  const { password: _, ...user } = match;
  await AsyncStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.currentUser);
  return raw ? JSON.parse(raw) : null;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.currentUser);
}

// --- Sales ---

export async function getSales(userId: string): Promise<DailySale[]> {
  const raw = await AsyncStorage.getItem(KEYS.sales(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function saveSale(userId: string, sale: DailySale): Promise<void> {
  const sales = await getSales(userId);
  const idx = sales.findIndex(s => s.date === sale.date);
  if (idx >= 0) {
    sales[idx] = sale;
  } else {
    sales.push(sale);
  }
  await AsyncStorage.setItem(KEYS.sales(userId), JSON.stringify(sales));
}

export async function getSaleByDate(userId: string, date: string): Promise<DailySale | null> {
  const sales = await getSales(userId);
  return sales.find(s => s.date === date) || null;
}

export function buildSaleSummary(sales: DailySale[]) {
  const total = sales.reduce((acc, s) => acc + s.amount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const avgProfit = sales.length > 0 ? totalProfit / sales.length : 0;
  const best = sales.reduce(
    (max, s) => (s.amount > (max?.amount ?? -1) ? s : max),
    null as DailySale | null
  );
  return { total, totalProfit, avgProfit, best, count: sales.length };
}
