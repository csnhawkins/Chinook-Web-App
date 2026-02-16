ALTER DATABASE ${databaseName} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

RESTORE DATABASE ${databaseName} FROM disk ='C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\Backup\Chinook_FullRestore.bak'
WITH MOVE 'Chinook_FullRestore' TO 'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\${databaseName}.mdf',
MOVE 'Chinook_FullRestore_Log' TO 'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\${databaseName}.ldf',
STATS = 10, REPLACE


ALTER DATABASE Chinook_FullRestore SET MULTI_USER;
GO