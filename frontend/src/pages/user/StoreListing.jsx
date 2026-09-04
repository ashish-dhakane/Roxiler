import { useState, useEffect, useCallback } from 'react';
import { storeAPI } from '../../api/stores';
import RatingStars from '../../components/RatingStars';
import Loading from '../../components/Loading';
import { ErrorMessage, SuccessMessage } from '../../components/Message';

export default function StoreListing() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ratingLoading, setRatingLoading] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        sort: sort.by,
        order: sort.order,
      };
      if (search) params.search = search;
      const res = await storeAPI.searchStores(params);
      setStores(res.data.stores);
    } catch (err) {
      setError('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field, order) => {
    setSort({ by: field, order: order });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleRate = async (storeId, rating) => {
    setRatingLoading(storeId);
    setError('');
    setSuccess('');
    try {
      const result = await storeAPI.submitRating({ store_id: storeId, rating });
      setSuccess(result.data.message);
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to submit rating.');
    } finally {
      setRatingLoading(null);
    }
  };

  const getSortIcon = (field) => {
    if (sort.by !== field) return '↕';
    return sort.order === 'asc' ? '↑' : '↓';
  };

  const toggleSort = (field) => {
    const newOrder = sort.by === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ by: field, order: newOrder });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Stores</h1>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search by store name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <Loading />
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <p>No stores found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')} className="sortable">
                    Store Name <span className={`sort-icon ${sort.by === 'name' ? 'active' : ''}`}>{getSortIcon('name')}</span>
                  </th>
                  <th onClick={() => toggleSort('address')} className="sortable">
                    Address <span className={`sort-icon ${sort.by === 'address' ? 'active' : ''}`}>{getSortIcon('address')}</span>
                  </th>
                  <th onClick={() => toggleSort('rating')} className="sortable">
                    Overall Rating <span className={`sort-icon ${sort.by === 'rating' ? 'active' : ''}`}>{getSortIcon('rating')}</span>
                  </th>
                  <th>Your Rating</th>
                  <th>Submit / Update</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td><strong>{store.name}</strong></td>
                    <td>{store.address}</td>
                    <td><RatingStars rating={store.rating} readonly /></td>
                    <td>
                      {store.user_rating ? (
                        <RatingStars rating={store.user_rating} readonly />
                      ) : (
                        <span className="text-muted">Not rated yet</span>
                      )}
                    </td>
                    <td>
                      {ratingLoading === store.id ? (
                        <span className="text-muted">Saving...</span>
                      ) : (
                        <RatingStars
                          rating={store.user_rating || 0}
                          onRate={(r) => handleRate(store.id, r)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
