import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import IDCreation from './IdCreation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import '../styles/modal.css';

// Modal component to confirm deletion
const Modal = ({ message, onClose, onDelete }) => (
  <div className="modal">
    <div className="modal-content">
      <div className="close-button" onClick={onClose}>&times;</div>
      <div className="modal-message">{message}</div>
      <div className="modal-buttons">
        <button className="modal-button" onClick={onDelete}>Yes</button>
        <button className="modal-button" onClick={onClose}>No</button>
      </div>
    </div>
  </div>
);

const AdminDashboard = ({ onIdCreationClick }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUsers, setNewUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const navigate = useNavigate();

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchFiles();
      getNewUsers();
      getTotalUsers();
      getTotalDocuments();
    };
    fetchData();
  }, []);

  // Fetch all files from the server
  const fetchFiles = async () => {
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

      setAllFiles(sortedFiles);
      setFilteredFiles(sortedFiles);
      setPageCount(Math.ceil(sortedFiles.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching files', error);
    }
  };

  // Fetch new users count
  const getNewUsers = async () => {
    try {
      const result = await axios.get("http://localhost:5001/new-users");
      setNewUsers(result.data.count);
    } catch (error) {
      console.error('Error fetching new users', error);
    }
  };

  // Fetch total users count
  const getTotalUsers = async () => {
    try {
      const result = await axios.get("http://localhost:5001/total-users");
      setTotalUsers(result.data.count);
    } catch (error) {
      console.error('Error fetching total users', error);
    }
  };

  // Fetch total documents count
  const getTotalDocuments = async () => {
    try {
      const result = await axios.get("http://localhost:5001/total-documents");
      setTotalDocuments(result.data.count);
    } catch (error) {
      console.error('Error fetching total documents', error);
    }
  };

  // Handle file deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/delete-file/${deleteId}`);
      setAllFiles(prevData => prevData.filter(item => item._id !== deleteId));
      setFilteredFiles(prevData => prevData.filter(item => item._id !== deleteId));
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error('Error deleting file', error);
      toast.error('Error deleting file');
    }
    setShowModal(false);
  };

  // Show delete confirmation modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setModalMessage("Are you sure you want to delete this file?");
    setShowModal(true);
  };

  // Handle user logout
  const handleLogout = () => {
    navigate('/');
    toast.success("Logged Out successfully!");
  };

  // Close the ID creation form
  const closeForm = () => {
    setShowForm(false);
  };

  // Handle pagination click
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const itemsPerPage = 7;

  // Fetch all files to prepare CSV data
  const fetchAllFiles = async () => {
    let allFiles = [];
    for (let page = 1; page <= pageCount; page++) {
      try {
        const response = await axios.get(`http://localhost:5001/all-files?page=${page}&limit=7`);
        allFiles = allFiles.concat(response.data.data);
      } catch (error) {
        console.error(`Error fetching files for page ${page}`, error);
      }
    }
    return allFiles.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA || new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    const csvRows = [];
    const headers = ['S No.', 'Username', 'File', 'Application', 'Description', 'Create Date', 'Update Date'];
    csvRows.push(headers.join(','));

    data.forEach((item, index) => {
      const row = [
        index + 1,
        item.username,
        item.title,
        item.application,
        item.description,
        formatDate(item.createdAt),
        formatDate(item.updatedAt),
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  // Download data as CSV
  const downloadCSV = async () => {
    const allFilesData = await fetchAllFiles();
    const csvData = convertToCSV(allFilesData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dashboard_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Exported to Excel!");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    const filtered = allFiles.filter((item) => {
      const title = item.title ? item.title.toLowerCase() : '';
      return title.includes(query);
    });

    setFilteredFiles(filtered);
    setPageCount(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  // Get files to display on current page
  const displayedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFiles = filteredFiles.length;
  const displayedFilesReversed = displayedFiles.map((item, index) => ({
    ...item,
    serialNumber: totalFiles - (currentPage - 1) * itemsPerPage - index,
  }));

  return (
    <>
      <div>
        <div className={`dashboard ${showForm ? 'blur' : ''}`}>
          <div className="dashboard-header">
            <h1>ADMIN'S DASHBOARD</h1>
            <div className="dashboard-actions">
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search" 
                  value={search} 
                  onChange={handleSearchChange}
                />
                <button>Search</button>
              </div>
              <nav className="nav-links">
                <a href='/'>Home</a>
                <a href="#id-creation" onClick={onIdCreationClick}>ID Creation</a>
                <Link to="/reports">Reports</Link>
                <a href="#logout" onClick={handleLogout}>Logout</a>
              </nav>
            </div>
          </div>
          <div className="info-cards">
            <button className="info-card">NEW USERS: <span className="red-text">{newUsers}</span></button>
            <button className="info-card">TOTAL USERS: <span className="red-text">{totalUsers}</span></button>
            <button className="info-card">TOTAL DOCUMENTS:<span className="red-text">{totalDocuments}</span></button>
          </div>
          <table className='dashboard-table'>
            <thead>
              <tr>
                <th>S No.</th>
                <th>Username</th>
                <th>File</th>
                <th>Application</th>
                <th>Description</th>
                <th>Create Date</th>
                <th>Update Date</th>
                <th>Download</th>
                <th>Delete</th>
                <th>Previous Versions</th>
              </tr>
            </thead>
            <tbody>
              {displayedFilesReversed.map((item, index) => (
                <tr key={item._id}>
                  <td>{item.serialNumber}</td>
                  <td>{item.username}</td>
                  <td>{item.title}</td>
                  <td>{item.application}</td>
                  <td>{item.description}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    <button className='buttons'>
                      <a href={`http://localhost:5001/${item.pdf}`} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </button>
                  </td>
                  <td><button className='buttons' onClick={() => handleDeleteClick(item._id)}>Delete</button></td>
                  <td>
                    <details>
                      <summary>View Versions</summary>
                      <ul>
                        {(item.previousVersions || []).map((version, idx) => (
                          <li key={idx}>
                            <div>{`Version ${idx + 1}`}</div>
                            <div>{`Date: ${formatDate(version.date)}`}</div>
                            <div>
                              <a href={`http://localhost:5001/${version.pdf}`} target="_blank" rel="noopener noreferrer">
                                Download
                              </a>
                              <button className='buttons' style={{ background: 'none', border: 'none', textDecoration: 'underline', color: "blue", marginLeft: '8px' }} onClick={() => handleDelete(version._id)}>Delete</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="export-csv-button" onClick={downloadCSV}>
            Export to CSV
          </button>
          <ReactPaginate
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="< previous"
            containerClassName="pagination"
            activeClassName="active"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            forcePage={currentPage - 1}
          />
        </div>
        {showForm && <IDCreation onClose={closeForm} />}
        {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => setShowModal(false)}
          onDelete={handleDelete}
        />
      )}
      </div>
    </>
  );
};

export default AdminDashboard;

