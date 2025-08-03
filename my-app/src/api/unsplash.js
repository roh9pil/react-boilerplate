import axios from 'axios';

const searchImages = async (term) => {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query: term,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching images from Unsplash", error);
    throw error;
  }
};

export { searchImages };
