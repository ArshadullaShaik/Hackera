import axios from 'axios'

const response = await axios.get(
    "https://api.luma.com/discover/get-paginated-events",{
        params: {
                discover_place_api_id: "discplace-G0tGUVYwl7T17Sb",
      pagination_limit: 25,
        },
        headers: {
            "User-Agent":
        "Mozilla/5.0",
      Accept: "application/json",
        },
    });
    console.log(response);
