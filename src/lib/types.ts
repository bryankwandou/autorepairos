export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type Item = {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
