# Chinook Music Store - Cross-Database Web Application

A self-contained project demonstrating cross-database capabilities across SQL Server, PostgreSQL, MySQL, and Oracle databases using a modern React web application built on the classic Chinook sample database.

## 📖 Overview

This project showcases a real-world scenario where a single web application seamlessly connects to and manages data across multiple database platforms. The Chinook Music Store web application provides a complete interface for viewing and editing music store data, demonstrating database-agnostic development practices and modern web application architecture.

## 🎵 About the Chinook Database

The Chinook database represents a digital media store, including tables for artists, albums, media tracks, invoices, and customers. This project uses an evolved version of the original Chinook database schema.

**Original Author**: Luis Rocha  
**Evolved by**: Chris Hawkins at Redgate Software Ltd  
**License**: [MIT License](https://github.com/lerocha/chinook-database/blob/master/LICENSE.md)

## 🏗️ Architecture

### Frontend
- **React 19.2.0** with TypeScript
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building
- **Lucide React** for modern iconography
- Responsive design supporting desktop and mobile

### Backend
- **Node.js** with Express.js
- **Knex.js** for database abstraction and query building
- Multi-database connection management
- RESTful API endpoints
- Real-time connection switching

### Supported Databases
- **Microsoft SQL Server** (2019+)
- **PostgreSQL** (12+)
- **MySQL** (8.0+)
- **Oracle Database** (19c+)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- At least one of the supported database systems
- Database administration tools (SSMS, pgAdmin, MySQL Workbench, SQL Developer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/csnhawkins/Chinook-Web-App.git
   cd Chinook-Web-App
   ```

2. **Set up your database(s)**
   
   Navigate to the `Database` folder and choose your database platform:
   
   ```
   Database/
   ├── MSSQL/          # SQL Server scripts
   ├── PostgreSQL/     # PostgreSQL scripts  
   ├── MySQL/          # MySQL scripts
   └── Oracle/         # Oracle scripts
   ```
   
   Run the appropriate creation script:
   - **Full database**: `Database_Creation-Chinook_[Platform]-Full.sql`
   - **Schema only**: `Database_Creation-Chinook_[Platform]-SchemaOnly.sql`

3. **Install application dependencies**
   ```bash
   cd Application
   npm install
   ```

4. **Configure database connections**
   
   Edit `connections.js` to add your database connection details:
   ```javascript
   const connections = {
     "my_sql_server": {
       client: "mssql",
       connection: {
         server: "localhost",
         database: "Chinook",
         user: "your_username",
         password: "your_password"
       }
     },
     "my_postgresql": {
       client: "pg", 
       connection: {
         host: "localhost",
         database: "chinook",
         user: "your_username", 
         password: "your_password"
       }
     }
     // Add MySQL and Oracle connections as needed
   };
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   
   Open your browser to `http://localhost:5173`

## 🎯 Features

### 🔄 Multi-Database Support
- **Connection Management**: Add, edit, and test database connections
- **Real-time Switching**: Switch between databases without restart
- **Visual Indicators**: Color-coded database type identification
- **Connection Testing**: Built-in connection validation

### 📊 Data Management
- **Customer Management**: View and search customer records
- **Artist & Album Catalog**: Browse music library with relationships
- **Track Management**: Detailed track information with duration formatting
- **Invoice System**: Complete invoice management with billing details
- **Reports & Analytics**: Revenue reporting with date filtering

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Environment Awareness**: Visual indicators for production/development
- **Admin Mode**: Role-based feature access
- **Search & Filtering**: Advanced search across all data types
- **Pagination**: Efficient handling of large datasets

### 🔧 Developer Features
- **Hot Reload**: Instant development feedback
- **TypeScript**: Full type safety
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed query and performance logging
- **API Documentation**: RESTful endpoints with clear interfaces

## 📁 Project Structure

```
Chinook-Web-App/
├── Application/                 # Main web application
│   ├── src/                    # React frontend source
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── services/          # API service layer
│   │   └── types/             # TypeScript definitions
│   ├── public/                # Static assets
│   ├── server.js              # Express.js backend
│   ├── connections.js         # Database configurations
│   └── package.json           # Node.js dependencies
├── Database/                   # Database creation scripts
│   ├── MSSQL/                 # SQL Server scripts
│   ├── PostgreSQL/            # PostgreSQL scripts
│   ├── MySQL/                 # MySQL scripts
│   └── Oracle/                # Oracle scripts
└── README.md                  # This file
```

## 🗃️ Database Schema

The Chinook database includes the following main entities:

- **Artist** - Music artists and bands
- **Album** - Music albums linked to artists  
- **Track** - Individual songs with metadata
- **Customer** - Store customers with contact details
- **Invoice** - Purchase records with billing information
- **Employee** - Store staff information
- **Genre** - Music genre classifications
- **MediaType** - Track format types (MP3, AAC, etc.)
- **Playlist** - Custom music collections

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production
The application can be deployed to any Node.js hosting platform:
- Configure production database connections
- Set environment variables for security
- Use process managers (PM2) for reliability
- Configure reverse proxy (nginx) if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Requirements

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space

### Database Requirements
- **SQL Server**: 2017+ (Express/Standard/Enterprise)
- **PostgreSQL**: 12+ 
- **MySQL**: 8.0+
- **Oracle**: 19c+ (XE/Standard/Enterprise)

### Development Tools (Optional)
- **VS Code** with recommended extensions
- **Database management tools** for your chosen platform
- **Postman** for API testing

## 🐛 Troubleshooting

### Common Issues

**Connection Errors**
- Verify database server is running
- Check connection string parameters
- Ensure firewall allows database connections
- Validate user permissions

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

**Performance Issues**
- Enable database query logging
- Check database indexes are present
- Monitor connection pool usage
- Review query execution plans

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The original Chinook Database is also under MIT License by Luis Rocha.

## 🙋‍♂️ Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/csnhawkins/Chinook-Web-App/issues)
- **Discussions**: [GitHub Discussions](https://github.com/csnhawkins/Chinook-Web-App/discussions)

## 🎉 Acknowledgments

- **Luis Rocha** - Original Chinook Database creator
- **Redgate Software Ltd** - Evolution and web application development
- **Open Source Community** - For the amazing tools and libraries used

---

*Built with ❤️ to demonstrate the power of cross-database application development*
