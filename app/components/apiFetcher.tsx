const API_BASE_URL = process.env.NEXT_PUBLIC_DOMAIN;

interface DateRow {
  date: string;
  endDate: string;
  ville: string;
  salle: string;
  participants: number;
  statut: string;
  tirage: string;
  placement: string[]; // Ajout du champ placement
  actions: string;
}

interface UpdateEvent {
  eventDate: string;
  city: string;
}

export const fetcher = (url: string) =>
  fetch(`${API_BASE_URL}${url}`).then((res) => res.json());

export const fetcherCustom = async (url: string, token?: string) => {
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const deleteEvent = async (id: string, token?: string, url?: string) => {
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const updateEvent = async (
  id: string,
  token?: string,
  url?: string,
  data?: UpdateEvent
) => {
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "PUT", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json(); // Parse the JSON response
  });
};

export const createEvent = async (
  url: string,
  token?: string,
  dateDatas?: DateRow
) => {
  const dateData = dateDatas;
  
  const eventData = {
    city: dateData?.ville,
    venue: dateData?.salle,
    eventDate: dateData?.date,
    status: dateData?.statut,
    endDate: dateData?.endDate,
    placement: dateData?.placement || [],
  };

  return await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const fetcherParticipants = async (url: string, token?: string) => {
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok && res.status !== 404) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const fetcherParticipantsByEvent = async (
  id: string,
  url: string,
  token?: string
) => {
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    // Tolérer 404 (aucun tirage/vainqueur pour cet événement)
    if (!res.ok && res.status !== 404) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const createTirageByEvent = async (
  id: string,
  url: string,
  token?: string,
  nombreVanquer?: number
) => {
  const data = {
    eventId: id,
    nombreVainqueur: nombreVanquer,
  };

  return await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const fetcherEventByID = async (
  id: string,
  url: string,
  token?: string
) => {
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};