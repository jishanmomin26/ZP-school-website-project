import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../Firebase/config';

const DonationRequests = () => {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    setLoading(true);

    const snap = await getDocs(collection(db, "donations"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setDonations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "donations", id), { status });
    fetchDonations();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Donation Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {donations.map(d => (
                <tr key={d.id} className="border-t">
                  <td>{d.name}</td>
                  <td>{d.phone}</td>
                  <td>{d.purpose}</td>
                  <td>{d.message || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      d.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {d.status}
                    </span>
                  </td>

                  <td>
                    {d.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(d.id, 'completed')}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
};

export default DonationRequests;