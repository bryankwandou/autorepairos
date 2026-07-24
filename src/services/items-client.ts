import { requestJson } from "@/services/http";

export type ItemDTO = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export async function getItems(token: string) {
  return requestJson<{ items: ItemDTO[] }>("/api/items", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createItem(token: string, payload: { title: string; description: string }) {
  return requestJson<{ message: string; item: ItemDTO }>("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateItem(
  token: string,
  id: string,
  payload: { title: string; description: string },
) {
  return requestJson<{ message: string; item: ItemDTO }>(`/api/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteItem(token: string, id: string) {
  return requestJson<{ message: string }>(`/api/items/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
