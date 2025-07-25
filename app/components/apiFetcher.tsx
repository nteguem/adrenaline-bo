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
  // Creating a headers object

  // Add the Authorization header only if the token is available

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "GET", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json(); // Parse the JSON response
  });
};

export const deleteEvent = async (id: string, token?: string, url?: string) => {
  // Add the Authorization header only if the token is available
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "DELETE", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json(); // Parse the JSON response
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
  // Add the Authorization header only if the token is available
  const dateData = dateDatas;
  
  // DEBUG: Log pour vérifier les données reçues
  console.log("=== DEBUG API FETCHER ===");
  console.log("dateDatas received:", dateDatas);
  console.log("dateData.placement:", dateData?.placement);
  
  const eventData = {
    city: dateData?.ville,
    venue: dateData?.salle,
    eventDate: dateData?.date,
    status: dateData?.statut,
    endDate: dateData?.endDate,
    eventId: "1235",
    placement: dateData?.placement || [], // Ajout du champ placement
  };

  // DEBUG: Log pour vérifier l'objet final
  console.log("eventData to send:", eventData);
  console.log("eventData.placement:", eventData.placement);
  console.log("========================");

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "POST", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
    body: JSON.stringify(eventData),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json(); // Parse the JSON response
  });
};

export const fetcherParticipants = async (url: string, token?: string) => {
  // Creating a headers object

  // Add the Authorization header only if the token is available

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "GET", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
  }).then((res) => {
    if (res.status === 404) {
      console.log(res.ok);
    }
    // if (!res.ok) {
    //   throw new Error("Network response was not ok");
    // }
    return res.json(); // Parse the JSON response
  });
};

export const fetcherParticipantsByEvent = async (
  id: string,
  url: string,
  token?: string
) => {
  // Creating a headers object

  // Add the Authorization header only if the token is available

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "GET", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
  }).then((res) => {
    if (!res.ok) {
      // throw new Error("Network response was not ok");
      return res.json();
    }
    return res.json(); // Parse the JSON response
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
  // Creating a headers object

  // Add the Authorization header only if the token is available

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}`, {
    method: "POST", // Specify the HTTP method (GET, POST, etc.)
    headers: {
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

export const fetcherEventByID = async (
  id: string,
  url: string,
  token?: string
) => {
  // Creating a headers object

  // Add the Authorization header only if the token is available

  // Make the fetch request
  return await fetch(`${API_BASE_URL}${url}/${id}`, {
    method: "GET", // Specify the HTTP method (GET, POST, etc.)
    headers: {
      Authorization: `Bearer ${token}`,
    }, // Set the headers in the request
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json(); // Parse the JSON response
  });
};