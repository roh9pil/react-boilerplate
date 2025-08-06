import axios from 'axios';

const searchImages = async (term, page = 1, sortBy = 'relevant') => {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query: term,
        page: page,
        per_page: 20,
        order_by: sortBy,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching images from Unsplash", error);
    throw error;
  }
};

export { searchImages };
