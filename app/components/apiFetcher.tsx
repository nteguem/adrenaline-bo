const API_BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3001';

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
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status}`,
        status: response.status,
        message: response.statusText,
        details: errorText
      };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error),
      type: 'network'
    };
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status}`,
        status: response.status,
        message: response.statusText,
        details: errorText
      };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error),
      type: 'network'
    };
  }
};

export const fetcherParticipantsByEvent = async (
  id: string,
  url: string,
  token?: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Tolérer 404 (aucun tirage/vainqueur pour cet événement)
    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status}`,
        status: response.status,
        message: response.statusText,
        details: errorText
      };
    }

    if (response.status === 404) {
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error),
      type: 'network'
    };
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}${url}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Tolérer 404 (aucun événement pour cet ID)
      if (response.status === 404) {
        return null;
      }

      return {
        success: false,
        error: `API Error: ${response.status}`,
        status: response.status,
        message: response.statusText,
        details: errorText
      };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error),
      type: 'network'
    };
  }
};
