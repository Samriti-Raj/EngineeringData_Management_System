**Engineering Data Lifecycle Management System (EDLMS)**
Overview:
The Engineering Data Lifecycle Management System (EDLMS) is a React-based platform designed to facilitate the management, upload, and access of engineering data files. The system provides a dual-tiered login system, where users can upload and download files, and admins have enhanced functionalities for managing the system, including user management, file deletion, and data export.

**Features**

Dual-Tiered Login:Separate access levels for users and admins.

Users: Can upload and download engineering files.
Admins: Manage users, delete files, and monitor system activity.
Admin Dashboard: A centralized interface for admins to manage users, handle data requests, and oversee files.

**File Management**:

Upload/Download: Users can upload files for engineering projects, and download them as needed.
Sorting/Filtering: Admins can sort and filter files for easy access.
CSV Export: Admins can export data to CSV for external analysis.
Notifications: Real-time notifications using Toastify for user feedback.

Pagination: Implemented with ReactPaginate for smooth navigation through large datasets.

**Technology Stack**
Front-End: React.js
Backend: Node.js, Express.js (if backend exists)
Database: MongoDB (if backend exists)
HTTP Requests: Axios
Routing: React Router DOM
Pagination: ReactPaginate
Notifications: Toastify
