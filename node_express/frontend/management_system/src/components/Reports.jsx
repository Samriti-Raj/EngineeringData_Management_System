import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AdminDashboard.css';
import ReactPaginate from 'react-paginate';

const Reports = ({ onIdCreationClick }) => {
  // State variables for various filters and data
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [username, setUsername] = useState('');
  const [allImage, setAllImage] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [filteredImages, setFilteredImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const navigate = useNavigate();

  // Fetch all user files whenever currentPage, fromDate, toDate, or username changes
  useEffect(() => {
    fetchAllUserFiles();
  }, [currentPage, fromDate, toDate, username]);

  const fetchAllUserFiles = async () => {
    try {
      let allFiles = [];
      let totalPages = 1;
      let currentPageNum = 1;

      // Fetch all pages sequentially
      while (currentPageNum <= totalPages) {
        const response = await axios.get(`http://localhost:5001/all-files?page=${currentPageNum}`);
        allFiles = [...allFiles, ...response.data.data];
        totalPages = response.data.totalPages;
        currentPageNum++;
      }

      // Sort the combined files
      const sortedFiles = allFiles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || new Date(b.createdAt) - new Date(a.createdAt);
      });

      setAllImage(sortedFiles);
      setPageCount(totalPages);
    } catch (error) {
      toast.error('Error fetching files');
      setAllImage([]);
    }
  };

  const filterImages = useCallback(() => {
    let filtered = allImage;

    if (username) {
      filtered = filtered.filter(item => item.username.toLowerCase().includes(username.toLowerCase()));
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(item => new Date(item.date) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter(item => new Date(item.date) <= to);
    }
    setFilteredImages(filtered);
  }, [allImage, fromDate, toDate, username]);

  // Apply filters and get total documents count whenever filters or allImage change
  useEffect(() => {
    filterImages();
    getTotalDocuments();
  }, [fromDate, toDate, username, allImage, filterImages]);

  // Handle user logout
  const handleLogout = () => {
    navigate('/');
    toast.success("Logged Out successfully!");
  };

  // Fetch total documents count from server
  const getTotalDocuments = async () => {
    try {
      const result = await axios.get("http://localhost:5001/total-documents");
      setTotalDocuments(result.data.count);
    } catch (error) {
      console.error('Error fetching total documents', error);
    }
  };

  // Handle file deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/delete-file/${id}`);
      setAllImage(prevData => prevData.filter(item => item._id !== id));
      toast.success("File deleted successfully!");
    } catch (error) {
      toast.error('Error deleting file');
    }
  };

  // Handle pagination page click
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  // Format date to 'dd/mm/yyyy' format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
  };

  const itemsPerPage = 7;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredImages.length);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>ADMIN'S DASHBOARD</h1>
        <div className="dashboard-actions">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="search-button">
              Search
            </button>
          </div>
          <nav className="nav-links">
            <a href="/admin-dashboard">Home</a>
            <a href="#id-creation" onClick={onIdCreationClick}>
              ID Creation
            </a>
            <a href="#reports" className="reports">
              Reports
            </a>
            <a href="#logout" onClick={handleLogout}>
              Logout
            </a>
          </nav>
        </div>
      </div>
      <div className="date-filters">
        <label htmlFor="fromDate">From:</label>
        <input
          type="date"
          id="fromDate"
          name="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label htmlFor="toDate">To:</label>
        <input
          type="date"
          id="toDate"
          name="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>S No.</th>
            <th>Username</th>
            <th>File</th>
            <th>Application</th>
            <th>Description</th>
            <th>Date</th>
            <th>Download</th>
            <th>Delete</th>
            <th>Previous Versions</th>
          </tr>
        </thead>
        <tbody>
          {filteredImages
            .filter((item) => {
              const title = item.title ? item.title.toLowerCase() : '';
              return search.trim() === ''
                ? true
                : title.includes(search.toLowerCase());
            })
            .slice(startIndex, endIndex)
            .map((item, index) => (
              <React.Fragment key={item._id}>
                <tr>
                  <td>{totalDocuments - startIndex - index}</td>
                  <td>{item.username}</td>
                  <td>{item.title}</td>
                  <td>{item.application}</td>
                  <td>{item.description}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <button className="buttons">
                      <a
                        href={`http://localhost:5001/${item.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </button>
                  </td>
                  <td>
                    <button className="buttons" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                  <td>
                    <details>
                      <summary>View Versions</summary>
                      <ul>
                        {(item.previousVersions || []).map((version, idx) => (
                          <li key={idx}>
                            <div>{`Version ${idx + 1}`}</div>
                            <div>{`Date: ${formatDate(version.date)}`}</div>
                            <div>
                              <a
                                href={`http://localhost:5001/${version.pdf}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Download
                              </a>
                              <button
                                className="buttons"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  textDecoration: 'underline',
                                  color: 'blue',
                                  marginLeft: '8px',
                                }}
                                onClick={() => handleDelete(version._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              </React.Fragment>
            ))}
        </tbody>
      </table>
      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
        marginPagesDisplayed={2}
        containerClassName="pagination justify-content-center"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        activeClassName="active"
      />
      <footer className="dashboard-footer">
        &copy; Copyright: 2024 Tata Motors
      </footer>
    </div>
  );
};

export default Reports;














