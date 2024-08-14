import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FormPage from './FormPage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { FaUser } from "react-icons/fa";
import '../styles/modal.css';

// Modal component for delete confirmation
const Modal = ({ message, onClose, onDelete }) => (  //In the Modal component you've shown, onClose and onDelete are props passed to the component. These props are expected to be functions defined by the parent component that uses the Modal component. 
  //The outer div with class modal represents the modal overlay that covers the entire screen.
  <div className="modal">
    {/*This div with class modal-content represents the main content area of the modal*/}
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

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [editFile, setEditFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userDocuments, setUserDocuments] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const navigate = useNavigate();

  // Effect to get the username from local storage and navigate if not found
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);  //When you retrieve data from localStorage, it is always returned as a string, even if you stored an object or any other type of data. To convert this string back into its original form (in this case, a JavaScript object), you need to parse it using JSON.parse.
      setUsername(user.username);           //Since the data is stored as a string, you need to parse it to convert it back to a JavaScript object:
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  // Function to fetch PDF files from the server
  const getPdf = useCallback(async (page) => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      console.error('No user information found in localStorage');
      navigate('/');
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user information from localStorage', error);
      navigate('/');
      return;
    }

    try {
      // Fetch the total count of user documents
      const documentsResult = await axios.get(`http://localhost:5001/user-documents?username=${user.username}`);
      setUserDocuments(documentsResult.data.count);
      // Fetch the paginated list of files
      const result = await axios.get(`http://localhost:5001/get-assets-files?username=${user.username}&page=${page}&limit=${itemsPerPage}`);
      // Sort files by date in descending order
      const sortedFiles = result.data.data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      setAllFiles(sortedFiles);
      setPageCount(result.data.totalPages);
    } catch (error) {
      console.error('Error fetching files', error);
      if (error.response && error.response.status === 401) {
        navigate('/');
      }
    }
  }, [navigate]);

  // Effect to fetch files whenever currentPage or username changes
  useEffect(() => {
    getPdf(currentPage);
  }, [getPdf, currentPage, username]);


  // Handler for successful file upload
  const handleUploadSuccess = (uploadedFile) => {
    if (editFile) {
      // Update the existing file
      setAllFiles(prevData =>
        prevData.map(file =>
          file._id === editFile._id ? uploadedFile : file
        )
      );
    } else {
      // Add the new file to the list
      setAllFiles(prevData => [uploadedFile, ...prevData]);
    }
    setShowForm(false);
    setEditFile(null);
    getPdf(currentPage);
  };
  
  // Handler for edit button click
  const handleEditClick = (file) => {
    setEditFile(file);
    setShowForm(true);
  };

  // Handler for delete confirmation
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/delete-file/${deleteId}`);  // Make a DELETE request to the server to delete the file with the given ID
      setAllFiles(prevData => prevData.filter(item => item._id !== deleteId)); //Update the state to remove the deleted file from the allFiles array
      toast.success("File deleted successfully!");  
      getPdf(currentPage); // Fetch the updated list of files for the current page
    } catch (error) {
      console.error('Error deleting file', error);
      toast.error('Error deleting file');
    }
    // Hide the modal after attempting to delete the file
    setShowModal(false);
  };
  
  // Handler for delete button click
  const handleDeleteClick = (id) => {
    // Set the ID of the file to be deleted
    setDeleteId(id);
    // Set the message to be displayed in the modal
    setModalMessage("Are you sure you want to delete this file?");
    // Show the modal
    setShowModal(true);
  };
  
  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    toast.success("Logged Out successfully!");
  };

  // Handler for pagination page click
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const itemsPerPage = 7;
  const startIndex = userDocuments - (currentPage - 1) * itemsPerPage;

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div>
      <div className={`dashboard ${showForm ? 'blur' : ''}`}>
        <div className="dashboard-header">
          <h1>DASHBOARD</h1>
          <div className="dashboard-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className="search-button">Search</button>
            </div>
            <nav className="nav-links">
              <a href="#upload" className="upload-link" onClick={() => setShowForm(true)}>Upload</a>
              <a href="#logout" onClick={handleLogout}>Logout</a>
              <a href="#username">{username} <FaUser /></a>
            </nav>
          </div>
        </div>
        <table id="dashboard-table" className='dashboard-table'>
          <thead>
            <tr>
              <th>S No.</th>
              <th>File</th>
              <th>Application</th>
              <th>Description</th>
              <th>Create Date</th>
              <th>Update Date</th>
              <th>Download</th>
              <th>Delete</th>
              <th>Edit</th>
              <th>Previous Versions</th>
            </tr>
          </thead>
          <tbody>
            { allFiles
              .filter(item => {
                const title = item.title ? item.title.toLowerCase() : '';
                return search.trim() === '' ? true : title.includes(search.toLowerCase());
              })
              .map((item, index) => (
                <tr key={item._id}>
                  <td>{startIndex - index}</td>
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
                  <td><button className='buttons' onClick={() => handleEditClick(item)}>Edit</button></td>
                  <td>
                    <details>
                      <summary>View Versions</summary>
                      <ul>
                        {(item.previousVersions || []).map((version) => (
                          <li key={version._id}>
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
        <ReactPaginate
          previousLabel={'<Previous'}
          nextLabel={'Next>'}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          pageClassName={'page-item'}
          pageLinkClassName={'page-link'}
          previousClassName={'page-item'}
          previousLinkClassName={'page-link'}
          nextClassName={'page-item'}
          nextLinkClassName={'page-link'}
          breakClassName={'page-item'}
          breakLinkClassName={'page-link'}
          activeClassName={'active'}
          disabledClassName={'disabled'}
        />
        <footer className='dashboard-footer'>
          &copy; Copyright: 2024 Tata Motors
        </footer>
      </div>
      {showForm && (
        <div className="modal">
          <div className="modal-content" style={{width:'25%'}}>
            <div className="close-button" onClick={() => setShowForm(false)}>&times;</div>
            <FormPage
              onUploadSuccess={handleUploadSuccess}
              onClose={() => setShowForm(false)}
              editFile={editFile}
            />
          </div>
        </div>
      )}
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => setShowModal(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Dashboard;















