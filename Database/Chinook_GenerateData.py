"""
Generate realistic large-scale data for Chinook database
Creates 1,000 customers and 4,000 invoices with realistic, diverse data
"""
import random
from datetime import datetime, timedelta

# Comprehensive lists of real names from various cultures
FIRST_NAMES = [
    # American/English
    'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin',
    'Emily', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Amy',
    'Brian', 'George', 'Ronald', 'Edward', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
    'Nancy', 'Betty', 'Sandra', 'Ashley', 'Kimberly', 'Donna', 'Emily', 'Michelle', 'Carol', 'Amanda',
    
    # European (German, French, Italian, Spanish, Nordic)
    'Hans', 'Friedrich', 'Wolfgang', 'Helmut', 'Werner', 'Klaus', 'Jürgen', 'Günter', 'Stefan', 'Andreas',
    'Petra', 'Sabine', 'Monika', 'Gabriele', 'Ursula', 'Helga', 'Ingrid', 'Brigitte', 'Renate', 'Karin',
    'Pierre', 'Jean', 'Michel', 'Philippe', 'Alain', 'Bernard', 'Laurent', 'Christophe', 'Patrick', 'François',
    'Marie', 'Nathalie', 'Isabelle', 'Sylvie', 'Catherine', 'Martine', 'Françoise', 'Christine', 'Sophie', 'Monique',
    'Marco', 'Giuseppe', 'Antonio', 'Francesco', 'Alessandro', 'Andrea', 'Paolo', 'Stefano', 'Carlo', 'Giorgio',
    'Maria', 'Anna', 'Giuseppina', 'Rosa', 'Angela', 'Giovanna', 'Teresa', 'Lucia', 'Carmela', 'Francesca',
    'Carlos', 'José', 'Manuel', 'Antonio', 'Francisco', 'Juan', 'Luis', 'Miguel', 'Pedro', 'Javier',
    'Carmen', 'Dolores', 'Pilar', 'Teresa', 'Ana', 'Josefa', 'Francisca', 'Isabel', 'Cristina', 'Mercedes',
    'Lars', 'Erik', 'Anders', 'Sven', 'Olof', 'Johan', 'Henrik', 'Magnus', 'Mikael', 'Karl',
    'Anna', 'Eva', 'Kristina', 'Ingrid', 'Karin', 'Birgitta', 'Marianne', 'Elisabeth', 'Lena', 'Helena',
    
    # Latin American
    'Diego', 'Mateo', 'Santiago', 'Sebastián', 'Nicolás', 'Alejandro', 'Samuel', 'Benjamín', 'Daniel', 'Matías',
    'Sofía', 'Valentina', 'Isabella', 'Camila', 'Martina', 'Lucía', 'Victoria', 'Emma', 'Emilia', 'Mía',
    
    # Brazilian/Portuguese
    'João', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Felipe', 'Guilherme', 'Matheus', 'Bruno', 'Rodrigo',
    'Ana', 'Julia', 'Beatriz', 'Mariana', 'Larissa', 'Camila', 'Fernanda', 'Amanda', 'Juliana', 'Gabriela',
    
    # Indian
    'Raj', 'Amit', 'Rahul', 'Rohan', 'Arjun', 'Sanjay', 'Vijay', 'Anil', 'Suresh', 'Rajesh',
    'Priya', 'Anjali', 'Kavita', 'Neha', 'Pooja', 'Sunita', 'Deepa', 'Rekha', 'Meera', 'Lakshmi',
    
    # Asian/Pacific
    'Wei', 'Chen', 'Ming', 'Jun', 'Feng', 'Hiroshi', 'Takeshi', 'Kenji', 'Yuki', 'Haruto',
    'Li', 'Ying', 'Mei', 'Yuki', 'Sakura', 'Hana', 'Aiko', 'Rin', 'Hina', 'Yui',
    
    # Middle Eastern
    'Mohammed', 'Ahmed', 'Ali', 'Omar', 'Hassan', 'Ibrahim', 'Yusuf', 'Abdullah', 'Khalid', 'Mahmoud',
    'Fatima', 'Aisha', 'Zainab', 'Maryam', 'Noor', 'Sara', 'Amina', 'Layla', 'Yasmin', 'Hana',
    
    # Slavic/Eastern European
    'Vladimir', 'Alexander', 'Dmitry', 'Sergei', 'Andrei', 'Nikolai', 'Ivan', 'Mikhail', 'Pavel', 'Alexei',
    'Olga', 'Natalia', 'Elena', 'Tatiana', 'Irina', 'Anna', 'Maria', 'Svetlana', 'Ekaterina', 'Yulia',
    'Piotr', 'Tomasz', 'Krzysztof', 'Andrzej', 'Jan', 'Marek', 'Pawel', 'Wojciech', 'Marcin', 'Lukasz',
    'Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Elżbieta', 'Joanna', 'Magdalena',
]

LAST_NAMES = [
    # English/American
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
    'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall',
    'Young', 'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
    'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
    
    # German
    'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
    'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun',
    
    # French
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
    'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
    
    # Italian
    'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
    'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti',
    
    # Spanish/Latin American
    'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Fernández', 'Gómez', 'García', 'Díaz',
    'Hernández', 'Ruiz', 'Jiménez', 'Álvarez', 'Moreno', 'Muñoz', 'Romero', 'Navarro', 'Torres', 'Domínguez',
    
    # Nordic
    'Johansson', 'Andersson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson',
    'Hansen', 'Nielsen', 'Jensen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen', 'Sørensen', 'Rasmussen', 'Petersen',
    
    # Brazilian/Portuguese
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
    
    # Indian
    'Patel', 'Singh', 'Kumar', 'Sharma', 'Gupta', 'Khan', 'Mehta', 'Shah', 'Verma', 'Agarwal',
    'Reddy', 'Rao', 'Nair', 'Pillai', 'Iyer', 'Desai', 'Joshi', 'Kulkarni', 'Bhat', 'Menon',
    
    # Slavic/Eastern European
    'Novak', 'Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański',
    'Ivanov', 'Petrov', 'Sidorov', 'Kuznetsov', 'Popov', 'Volkov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov',
]

# Real city/country combinations with proper geographic accuracy
LOCATIONS = [
    # USA - 200 entries for proportional representation
    ('USA', 'New York', 'NY', '10001-10292', '+1', '@yahoo.com'),
    ('USA', 'Los Angeles', 'CA', '90001-90899', '+1', '@gmail.com'),
    ('USA', 'Chicago', 'IL', '60601-60827', '+1', '@hotmail.com'),
    ('USA', 'Houston', 'TX', '77001-77299', '+1', '@outlook.com'),
    ('USA', 'Phoenix', 'AZ', '85001-85099', '+1', '@aol.com'),
    ('USA', 'Philadelphia', 'PA', '19101-19197', '+1', '@gmail.com'),
    ('USA', 'San Antonio', 'TX', '78201-78299', '+1', '@yahoo.com'),
    ('USA', 'San Diego', 'CA', '92101-92199', '+1', '@gmail.com'),
    ('USA', 'Dallas', 'TX', '75201-75398', '+1', '@hotmail.com'),
    ('USA', 'San Jose', 'CA', '95101-95199', '+1', '@gmail.com'),
    ('USA', 'Austin', 'TX', '78701-78799', '+1', '@outlook.com'),
    ('USA', 'Jacksonville', 'FL', '32099-32277', '+1', '@gmail.com'),
    ('USA', 'Fort Worth', 'TX', '76101-76199', '+1', '@yahoo.com'),
    ('USA', 'Columbus', 'OH', '43085-43287', '+1', '@gmail.com'),
    ('USA', 'San Francisco', 'CA', '94101-94199', '+1', '@gmail.com'),
    ('USA', 'Charlotte', 'NC', '28201-28299', '+1', '@hotmail.com'),
    ('USA', 'Indianapolis', 'IN', '46201-46299', '+1', '@yahoo.com'),
    ('USA', 'Seattle', 'WA', '98101-98199', '+1', '@gmail.com'),
    ('USA', 'Denver', 'CO', '80201-80299', '+1', '@outlook.com'),
    ('USA', 'Boston', 'MA', '02101-02297', '+1', '@gmail.com'),
    ('USA', 'Miami', 'FL', '33101-33299', '+1', '@hotmail.com'),
    ('USA', 'Atlanta', 'GA', '30301-30399', '+1', '@gmail.com'),
    ('USA', 'Detroit', 'MI', '48201-48299', '+1', '@yahoo.com'),
    ('USA', 'Nashville', 'TN', '37201-37250', '+1', '@gmail.com'),
    ('USA', 'Portland', 'OR', '97201-97299', '+1', '@outlook.com'),
    
    # Canada
    ('Canada', 'Toronto', 'ON', 'M4B-M6S', '+1', '@rogers.ca'),
    ('Canada', 'Montreal', 'QC', 'H1A-H9X', '+1', '@videotron.ca'),
    ('Canada', 'Vancouver', 'BC', 'V5K-V7Y', '+1', '@shaw.ca'),
    ('Canada', 'Calgary', 'AB', 'T2A-T3R', '+1', '@shaw.ca'),
    ('Canada', 'Edmonton', 'AB', 'T5A-T6X', '+1', '@telus.net'),
    ('Canada', 'Ottawa', 'ON', 'K1A-K4M', '+1', '@rogers.ca'),
    ('Canada', 'Winnipeg', 'MB', 'R2C-R3Y', '+1', '@mts.net'),
    ('Canada', 'Quebec City', 'QC', 'G1A-G9N', '+1', '@videotron.ca'),
    ('Canada', 'Hamilton', 'ON', 'L8E-L9K', '+1', '@cogeco.ca'),
    ('Canada', 'Halifax', 'NS', 'B3H-B3S', '+1', '@eastlink.ca'),
    
    # United Kingdom
    ('United Kingdom', 'London', None, 'SW1A-WC2N', '+44', '@btinternet.com'),
    ('United Kingdom', 'Manchester', None, 'M1-M99', '+44', '@sky.com'),
    ('United Kingdom', 'Birmingham', None, 'B1-B99', '+44', '@virgin.net'),
    ('United Kingdom', 'Leeds', None, 'LS1-LS99', '+44', '@talktalk.net'),
    ('United Kingdom', 'Glasgow', None, 'G1-G99', '+44', '@btinternet.com'),
    ('United Kingdom', 'Liverpool', None, 'L1-L99', '+44', '@sky.com'),
    ('United Kingdom', 'Newcastle', None, 'NE1-NE99', '+44', '@ntlworld.com'),
    ('United Kingdom', 'Sheffield', None, 'S1-S99', '+44', '@sky.com'),
    ('United Kingdom', 'Bristol', None, 'BS1-BS99', '+44', '@blueyonder.co.uk'),
    ('United Kingdom', 'Edinburgh', None, 'EH1-EH99', '+44', '@btinternet.com'),
    
    # Germany
    ('Germany', 'Berlin', None, '10115-14199', '+49', '@t-online.de'),
    ('Germany', 'Munich', None, '80331-81929', '+49', '@gmx.de'),
    ('Germany', 'Hamburg', None, '20095-22769', '+49', '@web.de'),
    ('Germany', 'Frankfurt', None, '60306-60599', '+49', '@t-online.de'),
    ('Germany', 'Stuttgart', None, '70173-70629', '+49', '@web.de'),
    ('Germany', 'Düsseldorf', None, '40210-40629', '+49', '@gmx.de'),
    ('Germany', 'Dortmund', None, '44135-44388', '+49', '@web.de'),
    ('Germany', 'Cologne', None, '50667-51149', '+49', '@t-online.de'),
    ('Germany', 'Leipzig', None, '04103-04358', '+49', '@gmx.de'),
    ('Germany', 'Dresden', None, '01067-01328', '+49', '@web.de'),
    
    # France
    ('France', 'Paris', None, '75001-75020', '+33', '@orange.fr'),
    ('France', 'Marseille', None, '13001-13016', '+33', '@sfr.fr'),
    ('France', 'Lyon', None, '69001-69009', '+33', '@wanadoo.fr'),
    ('France', 'Toulouse', None, '31000-31600', '+33', '@orange.fr'),
    ('France', 'Nice', None, '06000-06300', '+33', '@free.fr'),
    ('France', 'Nantes', None, '44000-44300', '+33', '@orange.fr'),
    ('France', 'Strasbourg', None, '67000-67200', '+33', '@wanadoo.fr'),
    ('France', 'Montpellier', None, '34000-34295', '+33', '@sfr.fr'),
    ('France', 'Bordeaux', None, '33000-33800', '+33', '@orange.fr'),
    ('France', 'Lille', None, '59000-59800', '+33', '@free.fr'),
    
    # Brazil
    ('Brazil', 'São Paulo', 'SP', '01000-05999', '+55', '@uol.com.br'),
    ('Brazil', 'Rio de Janeiro', 'RJ', '20000-23799', '+55', '@globo.com'),
    ('Brazil', 'Brasília', 'DF', '70000-72799', '+55', '@gmail.com'),
    ('Brazil', 'Salvador', 'BA', '40000-42999', '+55', '@hotmail.com'),
    ('Brazil', 'Fortaleza', 'CE', '60000-61999', '+55', '@gmail.com'),
    ('Brazil', 'Belo Horizonte', 'MG', '30000-31999', '+55', '@yahoo.com.br'),
    ('Brazil', 'Curitiba', 'PR', '80000-82999', '+55', '@gmail.com'),
    ('Brazil', 'Recife', 'PE', '50000-52999', '+55', '@hotmail.com'),
    ('Brazil', 'Porto Alegre', 'RS', '90000-91999', '+55', '@terra.com.br'),
    ('Brazil', 'Manaus', 'AM', '69000-69099', '+55', '@gmail.com'),
    
    # Australia
    ('Australia', 'Sydney', 'NSW', '2000-2999', '+61', '@bigpond.com'),
    ('Australia', 'Melbourne', 'VIC', '3000-3999', '+61', '@optusnet.com.au'),
    ('Australia', 'Brisbane', 'QLD', '4000-4999', '+61', '@bigpond.net.au'),
    ('Australia', 'Perth', 'WA', '6000-6999', '+61', '@iinet.net.au'),
    ('Australia', 'Adelaide', 'SA', '5000-5999', '+61', '@bigpond.com'),
    ('Australia', 'Gold Coast', 'QLD', '4217-4227', '+61', '@optusnet.com.au'),
    ('Australia', 'Canberra', 'ACT', '2600-2618', '+61', '@bigpond.com'),
    ('Australia', 'Newcastle', 'NSW', '2300-2322', '+61', '@bigpond.net.au'),
    
    # India
    ('India', 'Mumbai', None, '400001-400099', '+91', '@gmail.com'),
    ('India', 'Delhi', None, '110001-110096', '+91', '@rediffmail.com'),
    ('India', 'Bangalore', None, '560001-560099', '+91', '@yahoo.co.in'),
    ('India', 'Hyderabad', None, '500001-500096', '+91', '@gmail.com'),
    ('India', 'Chennai', None, '600001-600096', '+91', '@yahoo.in'),
    ('India', 'Kolkata', None, '700001-700156', '+91', '@rediffmail.com'),
    ('India', 'Pune', None, '411001-411062', '+91', '@gmail.com'),
    ('India', 'Ahmedabad', None, '380001-380060', '+91', '@yahoo.co.in'),
    
    # Spain
    ('Spain', 'Madrid', None, '28001-28080', '+34', '@hotmail.es'),
    ('Spain', 'Barcelona', None, '08001-08080', '+34', '@gmail.com'),
    ('Spain', 'Valencia', None, '46001-46025', '+34', '@yahoo.es'),
    ('Spain', 'Seville', None, '41001-41020', '+34', '@hotmail.com'),
    ('Spain', 'Zaragoza', None, '50001-50018', '+34', '@gmail.com'),
    
    # Italy  
    ('Italy', 'Rome', 'RM', '00118-00199', '+39', '@libero.it'),
    ('Italy', 'Milan', 'MI', '20121-20162', '+39', '@alice.it'),
    ('Italy', 'Naples', 'NA', '80121-80147', '+39', '@virgilio.it'),
    ('Italy', 'Turin', 'TO', '10121-10156', '+39', '@libero.it'),
    ('Italy', 'Florence', 'FI', '50121-50145', '+39', '@alice.it'),
    
    # Additional countries for diversity
    ('Netherlands', 'Amsterdam', None, '1011-1109', '+31', '@ziggo.nl'),
    ('Netherlands', 'Rotterdam', None, '3011-3089', '+31', '@kpnmail.nl'),
    ('Belgium', 'Brussels', None, '1000-1299', '+32', '@skynet.be'),
    ('Belgium', 'Antwerp', None, '2000-2660', '+32', '@telenet.be'),
    ('Sweden', 'Stockholm', None, '111 20-191 91', '+46', '@telia.com'),
    ('Sweden', 'Gothenburg', None, '411 01-432 98', '+46', '@bredband.net'),
    ('Norway', 'Oslo', None, '0001-1299', '+47', '@online.no'),
    ('Denmark', 'Copenhagen', None, '1000-2990', '+45', '@mail.dk'),
    ('Finland', 'Helsinki', None, '00100-00990', '+358', '@kolumbus.fi'),
    ('Poland', 'Warsaw', None, '00-001-04-999', '+48', '@wp.pl'),
    ('Poland', 'Krakow', None, '30-001-33-999', '+48', '@o2.pl'),
    ('Czech Republic', 'Prague', None, '110 00-199 00', '+420', '@seznam.cz'),
    ('Austria', 'Vienna', None, '1010-1239', '+43', '@aon.at'),
    ('Switzerland', 'Zurich', None, '8000-8099', '+41', '@bluewin.ch'),
    ('Portugal', 'Lisbon', None, '1000-1990', '+351', '@sapo.pt'),
    ('Portugal', 'Porto', None, '4000-4990', '+351', '@netcabo.pt'),
    ('Ireland', 'Dublin', None, 'D01-D24', '+353', '@eircom.net'),
    ('Greece', 'Athens', None, '104 31-118 55', '+30', '@otenet.gr'),
    ('Turkey', 'Istanbul', None, '34000-34850', '+90', '@hotmail.com'),
    ('Russia', 'Moscow', None, '101000-129110', '+7', '@mail.ru'),
    ('Russia', 'St Petersburg', None, '190000-199406', '+7', '@yandex.ru'),
    ('Argentina', 'Buenos Aires', None, 'C1000-C1439', '+54', '@hotmail.com'),
    ('Chile', 'Santiago', None, '8320000-8580000', '+56', '@gmail.com'),
    ('Mexico', 'Mexico City', None, '01000-16999', '+52', '@hotmail.com'),
    ('South Africa', 'Johannesburg', None, '2001-2199', '+27', '@mweb.co.za'),
    ('South Africa', 'Cape Town', None, '7700-8001', '+27', '@vodamail.co.za'),
    ('Japan', 'Tokyo', None, '100-0001-190-0023', '+81', '@docomo.ne.jp'),
    ('Japan', 'Osaka', None, '530-0001-599-8531', '+81', '@softbank.jp'),
    ('South Korea', 'Seoul', None, '01000-08826', '+82', '@naver.com'),
    ('China', 'Beijing', None, '100000-102629', '+86', '@qq.com'),
    ('China', 'Shanghai', None, '200000-202183', '+86', '@163.com'),
    ('Singapore', 'Singapore', None, '018900-828909', '+65', '@singnet.com.sg'),
    ('Malaysia', 'Kuala Lumpur', None, '50000-60000', '+60', '@gmail.com'),
    ('Thailand', 'Bangkok', None, '10100-10600', '+66', '@hotmail.com'),
    ('New Zealand', 'Auckland', None, '0600-2699', '+64', '@xtra.co.nz'),
    ('New Zealand', 'Wellington', None, '6001-6242', '+64', '@paradise.net.nz'),
]

def generate_customers(start_id=60, count=941):
    """Generate realistic customer data
    
    Returns:
        tuple: (customers_sql_list, customers_dict)
            - customers_sql_list: List of SQL INSERT values
            - customers_dict: Dict mapping customer_id to customer data for invoice generation
    """
    customers = []
    customers_dict = {}  # Store customer data for invoice billing addresses
    used_emails = set()
    
    for i in range(count):
        customer_id = start_id + i
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        # Add middle initial (40% chance) and suffix (5% chance) for variety
        if random.random() < 0.40:
            middle_initial = random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            first_name = f"{first_name} {middle_initial}."
        
        if random.random() < 0.05:
            suffix = random.choice(['Jr.', 'Sr.', 'III', 'II', 'IV'])
            last_name = f"{last_name} {suffix}"
        
        location = random.choice(LOCATIONS)
        country, city, state, postal_prefix, phone_prefix, email_domain = location
        
        # Generate unique email
        base_email = f"{first_name.lower().replace(' ', '')}.{last_name.lower().replace(' ', '')}"
        email = f"{base_email}{customer_id}{email_domain}"
        
        # Ensure uniqueness
        counter = 1
        while email in used_emails:
            email = f"{base_email}{customer_id}_{counter}{email_domain}"
            counter += 1
        used_emails.add(email)
        
        # Generate address
        street_num = random.randint(1, 9999)
        street_names = ['Main St', 'High St', 'Park Ave', 'Oak Rd', 'Maple Dr', 'Church St', 
                       'Market St', 'Station Rd', 'King St', 'Queen St', 'Victoria Rd']
        address = f"{street_num} {random.choice(street_names)}"
        
        # Postal code based on range
        if '-' in postal_prefix:
            parts = postal_prefix.split('-')
            if parts[0].replace(' ', '').isdigit() and parts[1].replace(' ', '').isdigit():
                min_val = int(parts[0].replace(' ', ''))
                max_val = int(parts[1].replace(' ', ''))
                if min_val < max_val:
                    postal = str(random.randint(min_val, max_val))
                else:
                    postal = parts[0]
            else:
                postal = parts[0]
        else:
            postal = postal_prefix
            
        # Phone number
        phone = f"{phone_prefix} ({random.randint(100,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"
        
        # Support rep (3-5)
        support_rep = random.randint(3, 5)
        
        # 30% chance of having a company
        company = None
        if random.random() < 0.3:
            company_names = ['Tech Solutions Inc', 'Global Industries', 'Digital Systems Ltd', 
                           'Innovations Corp', 'Enterprise Solutions', 'Business Services Group',
                           'Technology Partners', 'Consulting Group', 'Professional Services',
                           'Development Solutions', 'Software Systems', 'IT Services Ltd']
            company = random.choice(company_names)
        
        # Store customer data for invoice billing
        customers_dict[customer_id] = {
            'address': address,
            'city': city,
            'state': state,
            'country': country,
            'postal': postal
        }
        
        state_str = f"N'{state}'" if state else 'NULL'
        company_str = f"N'{company}'" if company else 'NULL'
        
        customer = f"    (N'{first_name}', N'{last_name}', {company_str}, N'{address}', N'{city}', {state_str}, N'{country}', N'{postal}', N'{phone}', NULL, N'{email}', {support_rep})"
        customers.append(customer)
    
    return customers, customers_dict

def generate_systemlog(count=5000, invoice_count=3588):
    """Generate SystemLog entries for database size inflation
    
    Creates realistic-looking log data. Padding is generated by SQL Server during insertion
    using REPLICATE() function for maximum speed and minimal memory usage.
    
    Note: Matches actual SystemLog schema (LogId, InvoiceId, LogDate, LogMessage)
    
    Args:
        count: Number of log entries (each ~7.8KB after SQL padding, so 65000 rows ≈ 500MB)
        invoice_count: Number of invoices generated (to ensure valid FK references)
    
    Returns:
        List of SQL INSERT values for SystemLog table
    """
    log_entries = []
    
    # Template messages for log entries
    log_templates = [
        "Invoice #{0} processed successfully",
        "Payment confirmation for invoice #{0}",
        "Invoice #{0} sent to customer via email",
        "Invoice #{0} marked as paid - Transaction ID: TXN{1}",
        "Reminder sent for invoice #{0}",
        "Invoice #{0} payment received - Amount: ${2}",
        "Invoice #{0} generated for customer ID {3}",
        "Processing payment for invoice #{0}",
        "Invoice #{0} delivery confirmation received",
        "Invoice #{0} status updated to completed"
    ]
    
    # Start date: Jan 1, 2022
    start_date = datetime(2022, 1, 1)
    end_date = datetime(2026, 1, 19)
    total_days = (end_date - start_date).days
    
    # Invoice IDs start at 413 and we generate a specific count
    invoice_id_start = 413
    invoice_id_end = invoice_id_start + invoice_count - 1
    
    for i in range(count):
        log_id = 1000 + i  # Start from 1000 to avoid conflicts with existing logs
        
        # Random invoice ID from the ACTUAL range of generated invoices
        invoice_id = random.randint(invoice_id_start, invoice_id_end)
        
        # Random timestamp
        random_days = random.randint(0, total_days)
        log_time = start_date + timedelta(days=random_days, 
                                          hours=random.randint(0, 23),
                                          minutes=random.randint(0, 59),
                                          seconds=random.randint(0, 59))
        log_date = log_time.strftime('%Y-%m-%d %H:%M:%S')
        
        # Random template with data
        template = random.choice(log_templates)
        message = template.format(
            invoice_id,                          # {0} - invoice ID
            random.randint(100000, 999999),     # {1} - transaction ID
            round(random.uniform(0.99, 99.99), 2),  # {2} - amount
            random.randint(1, 10000)            # {3} - customer ID
        )
        
        # Escape single quotes
        message_escaped = message.replace("'", "''")
        
        # Note: Padding will be added by SQL Server using REPLICATE() during insertion
        log_entry = f"    ({log_id}, {invoice_id}, '{log_date}', N'{message_escaped}')"
        log_entries.append(log_entry)
    
    return log_entries

def generate_invoices(start_id=413, count=3588, customer_count=1000, customer_id_start=1, customers_dict=None):
    """Generate realistic invoice data for 2022-2026 (Jan 1, 2022 - Jan 19, 2026)
    
    Args:
        start_id: Starting invoice ID
        count: Number of invoices to generate
        customer_count: Total number of customers (determines max customer ID)
        customer_id_start: Starting customer ID (use 60 if database only has new customers)
        customers_dict: Dictionary mapping customer_id to address data (for realistic billing)
    """
    invoices = []
    invoice_lines = []
    invoice_line_id = 2241  # Starting after existing invoice lines (2240 in base DB)
    
    # Start date: Jan 1, 2022
    start_date = datetime(2022, 1, 1)
    # End date: Jan 19, 2026 (current date)
    end_date = datetime(2026, 1, 19)
    
    total_days = (end_date - start_date).days
    
    # Track price (most tracks are 0.99, some are 1.99)
    track_prices = [0.99, 0.99, 0.99, 0.99, 1.99]  # 80% at 0.99, 20% at 1.99
    
    customer_id_end = customer_id_start + customer_count - 1
    
    for i in range(count):
        invoice_id = start_id + i
        
        # Random customer from the range of customers that actually exist
        customer_id = random.randint(customer_id_start, customer_id_end)
        
        # Random date between Jan 1, 2022 and Jan 19, 2026
        random_days = random.randint(0, total_days)
        invoice_date = start_date + timedelta(days=random_days)
        
        date_str = invoice_date.strftime('%Y/%m/%d')
        
        # Determine number of tracks to purchase (1-10 tracks, weighted toward smaller purchases)
        weights = [0.30, 0.25, 0.15, 0.10, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01]  # 1-10 tracks
        num_tracks = random.choices(range(1, 11), weights=weights)[0]
        
        # Generate invoice lines and calculate total
        invoice_total = 0
        used_tracks = set()
        
        for _ in range(num_tracks):
            # Select a random track (1-3503 for existing tracks, or up to 3942 if new tracks added)
            track_id = random.randint(1, 3942)
            
            # Avoid duplicate tracks in same invoice
            if track_id in used_tracks:
                track_id = random.randint(1, 3942)
            used_tracks.add(track_id)
            
            # Unit price and quantity
            unit_price = random.choice(track_prices)
            quantity = random.choices([1, 2, 3], weights=[0.80, 0.15, 0.05])[0]  # Most purchases are qty 1
            
            line_total = round(unit_price * quantity, 2)
            invoice_total += line_total
            
            # Create invoice line
            invoice_line = f"    ({invoice_line_id}, {invoice_id}, {track_id}, {unit_price}, {quantity})"
            invoice_lines.append(invoice_line)
            invoice_line_id += 1
        
        invoice_total = round(invoice_total, 2)
        
        invoice_total = round(invoice_total, 2)
        
        # Use customer's billing address (90% of the time) or generate random address (10% for different shipping)
        if customers_dict and customer_id in customers_dict and random.random() < 0.90:
            # Use customer's actual address
            customer_data = customers_dict[customer_id]
            billing_address = customer_data['address']
            city = customer_data['city']
            state = customer_data['state']
            country = customer_data['country']
            postal = customer_data['postal']
        else:
            # Generate random billing address (for gift purchases, work address, etc.)
            location = random.choice(LOCATIONS)
            country, city, state, postal_prefix, _, _ = location
            
            street_num = random.randint(1, 9999)
            street_names = ['Main St', 'High St', 'Park Ave', 'Oak Rd', 'Maple Dr', 'Church St']
            billing_address = f"{street_num} {random.choice(street_names)}"
            
            if '-' in postal_prefix:
                parts = postal_prefix.split('-')
                if parts[0].replace(' ', '').isdigit() and parts[1].replace(' ', '').isdigit():
                    min_val = int(parts[0].replace(' ', ''))
                    max_val = int(parts[1].replace(' ', ''))
                    if min_val < max_val:
                        postal = str(random.randint(min_val, max_val))
                    else:
                        postal = parts[0]
                else:
                    postal = parts[0]
            else:
                postal = postal_prefix
        
        state_str = f"N'{state}'" if state else 'NULL'
        
        invoice = f"    ({customer_id}, '{date_str}', N'{billing_address}', N'{city}', {state_str}, N'{country}', N'{postal}', {invoice_total})"
        invoices.append(invoice)
    
    return invoices, invoice_lines

# Real artists from charts with clean content (200 popular artists)
CHART_ARTISTS = [
    # Pop/Contemporary (50 artists)
    ('Taylor Swift', [('1989', ['Shake It Off', 'Blank Space', 'Style', 'Bad Blood', 'Wildest Dreams']),
                      ('Fearless', ['Love Story', 'You Belong With Me', 'Fifteen', 'White Horse'])]),
    ('Ed Sheeran', [('Divide', ['Shape of You', 'Castle on the Hill', 'Perfect', 'Galway Girl']),
                    ('Multiply', ['Thinking Out Loud', 'Photograph', 'Sing'])]),
    ('Adele', [('21', ['Rolling in the Deep', 'Someone Like You', 'Set Fire to the Rain', 'Rumour Has It']),
               ('25', ['Hello', 'When We Were Young', 'Send My Love'])]),
    ('Bruno Mars', [('Unorthodox Jukebox', ['Locked Out of Heaven', 'When I Was Your Man', 'Treasure']),
                    ('Doo-Wops & Hooligans', ['Just The Way You Are', 'Grenade', 'The Lazy Song'])]),
    ('Ariana Grande', [('Thank U Next', ['7 Rings', 'Thank U Next', 'Break Up With Your Girlfriend']),
                       ('Sweetener', ['No Tears Left To Cry', 'God Is A Woman'])]),
    ('Justin Bieber', [('Purpose', ['Sorry', 'Love Yourself', 'What Do You Mean']),
                       ('Believe', ['Boyfriend', 'As Long As You Love Me'])]),
    ('Katy Perry', [('Teenage Dream', ['California Gurls', 'Teenage Dream', 'Firework', 'E.T.']),
                    ('Prism', ['Roar', 'Dark Horse', 'Unconditionally'])]),
    ('Rihanna', [('Loud', ['Only Girl', 'What\'s My Name', 'S&M', 'California King Bed']),
                 ('Anti', ['Work', 'Needed Me', 'Love On The Brain'])]),
    ('The Weeknd', [('Starboy', ['Starboy', 'I Feel It Coming', 'Party Monster']),
                    ('After Hours', ['Blinding Lights', 'Save Your Tears', 'In Your Eyes'])]),
    ('Billie Eilish', [('When We All Fall Asleep', ['Bad Guy', 'Bury A Friend', 'When The Party\'s Over']),
                       ('Happier Than Ever', ['Happier Than Ever', 'My Future'])]),
    
    # Rock/Alternative (40 artists)
    ('Imagine Dragons', [('Night Visions', ['Radioactive', 'Demons', 'It\'s Time', 'On Top Of The World']),
                         ('Evolve', ['Believer', 'Thunder', 'Whatever It Takes'])]),
    ('Coldplay', [('A Rush of Blood to the Head', ['The Scientist', 'Clocks', 'In My Place']),
                  ('Viva la Vida', ['Viva la Vida', 'Violet Hill', 'Lost'])]),
    ('Foo Fighters', [('Wasting Light', ['Rope', 'Walk', 'These Days', 'Arlandria']),
                      ('Concrete and Gold', ['Run', 'The Sky Is A Neighborhood'])]),
    ('Muse', [('Black Holes and Revelations', ['Supermassive Black Hole', 'Starlight', 'Knights of Cydonia']),
              ('The Resistance', ['Uprising', 'Resistance', 'Undisclosed Desires'])]),
    ('Arctic Monkeys', [('AM', ['Do I Wanna Know', 'R U Mine', 'Why\'d You Only Call Me When You\'re High']),
                        ('Whatever People Say I Am', ['I Bet You Look Good On The Dancefloor'])]),
    ('The Killers', [('Hot Fuss', ['Mr. Brightside', 'Somebody Told Me', 'All These Things That I\'ve Done']),
                     ('Day & Age', ['Human', 'Spaceman'])]),
    ('Linkin Park', [('Hybrid Theory', ['In The End', 'Crawling', 'One Step Closer', 'Papercut']),
                     ('Meteora', ['Numb', 'Somewhere I Belong', 'Faint'])]),
    ('Green Day', [('American Idiot', ['Boulevard of Broken Dreams', 'Holiday', 'Wake Me Up When September Ends']),
                   ('21st Century Breakdown', ['Know Your Enemy', '21 Guns'])]),
    ('Red Hot Chili Peppers', [('Stadium Arcadium', ['Dani California', 'Snow', 'Tell Me Baby']),
                               ('Californication', ['Californication', 'Scar Tissue', 'Otherside'])]),
    ('Pearl Jam', [('Ten', ['Alive', 'Even Flow', 'Jeremy', 'Black']),
                   ('Vs.', ['Daughter', 'Animal', 'Dissident'])]),
    
    # Hip Hop/R&B (30 artists - clean content only)
    ('Drake', [('Views', ['One Dance', 'Controlla', 'Too Good', 'Hotline Bling']),
               ('Scorpion', ['God\'s Plan', 'In My Feelings', 'Nice For What'])]),
    ('Beyoncé', [('Lemonade', ['Formation', 'Hold Up', 'Sorry', 'Freedom']),
                 ('Beyoncé', ['Drunk in Love', 'Partition', 'Pretty Hurts'])]),
    ('Kendrick Lamar', [('DAMN.', ['HUMBLE.', 'LOYALTY.', 'LOVE.', 'DNA.']),
                        ('Good Kid MAAD City', ['Swimming Pools', 'Poetic Justice'])]),
    ('Post Malone', [('Beerbongs & Bentleys', ['Rockstar', 'Psycho', 'Better Now']),
                     ('Hollywood\'s Bleeding', ['Circles', 'Sunflower', 'Wow'])]),
    ('The Weeknd', [('Beauty Behind The Madness', ['Can\'t Feel My Face', 'The Hills', 'Earned It']),
                    ('Starboy', ['Starboy', 'I Feel It Coming'])]),
    ('Kanye West', [('Graduation', ['Stronger', 'Good Life', 'Flashing Lights']),
                    ('My Beautiful Dark Twisted Fantasy', ['Power', 'Runaway', 'All Of The Lights'])]),
    ('Jay-Z', [('The Blueprint', ['Izzo', 'Song Cry', 'Renegade']),
               ('The Black Album', ['99 Problems', 'Dirt Off Your Shoulder'])]),
    ('Nicki Minaj', [('Pink Friday', ['Super Bass', 'Moment 4 Life', 'Fly']),
                     ('The Pinkprint', ['Anaconda', 'Feeling Myself'])]),
    ('Cardi B', [('Invasion of Privacy', ['Bodak Yellow', 'I Like It', 'Be Careful']),
                 ('Gangsta Bitch Music', ['Bartier Cardi'])]),
    ('Travis Scott', [('Astroworld', ['SICKO MODE', 'STARGAZING', 'STOP TRYING TO BE GOD']),
                      ('Birds in the Trap', ['Goosebumps', 'Pick Up The Phone'])]),
    
    # Country (20 artists)
    ('Luke Combs', [('This One\'s for You', ['Hurricane', 'When It Rains It Pours', 'One Number Away']),
                    ('What You See Is What You Get', ['Beer Never Broke My Heart', 'Even Though I\'m Leaving'])]),
    ('Morgan Wallen', [('Dangerous', ['7 Summers', 'More Than My Hometown', 'Sand In My Boots']),
                       ('If I Know Me', ['Whiskey Glasses', 'Chasin\' You'])]),
    ('Carrie Underwood', [('Some Hearts', ['Before He Cheats', 'Jesus Take The Wheel', 'Wasted']),
                          ('Cry Pretty', ['Cry Pretty', 'Love Wins', 'Southbound'])]),
    ('Blake Shelton', [('Based On A True Story', ['Sure Be Cool If You Did', 'Boys Round Here']),
                       ('If I\'m Honest', ['Came Here To Forget', 'Savior\'s Shadow'])]),
    ('Keith Urban', [('Ripcord', ['Blue Ain\'t Your Color', 'The Fighter', 'Wasted Time']),
                     ('Golden Road', ['Somebody Like You', 'You\'ll Think Of Me'])]),
    ('Florida Georgia Line', [('Here\'s to the Good Times', ['Cruise', 'Get Your Shine On', 'Round Here']),
                              ('Anything Goes', ['Dirt', 'Sun Daze'])]),
    ('Zac Brown Band', [('The Foundation', ['Chicken Fried', 'Toes', 'Whatever It Is']),
                        ('You Get What You Give', ['Homegrown', 'Keep Me In Mind'])]),
    ('Tim McGraw', [('Live Like You Were Dying', ['Live Like You Were Dying', 'Back When']),
                    ('Emotional Traffic', ['Felt Good On My Lips'])]),
    ('Brad Paisley', [('Time Well Wasted', ['Alcohol', 'The World', 'When I Get Where I\'m Going']),
                      ('Moonshine in the Trunk', ['River Bank', 'Perfect Storm'])]),
    ('Miranda Lambert', [('Revolution', ['White Liar', 'The House That Built Me', 'Dead Flowers']),
                         ('Platinum', ['Automatic', 'Somethin\' Bad'])]),
    
    # Electronic/Dance (15 artists)
    ('Calvin Harris', [('18 Months', ['Feel So Close', 'Sweet Nothing', 'We Found Love']),
                       ('Motion', ['Summer', 'Outside', 'How Deep Is Your Love'])]),
    ('David Guetta', [('Nothing but the Beat', ['Titanium', 'Where Them Girls At', 'Without You']),
                      ('Listen', ['Dangerous', 'Hey Mama', 'What I Did For Love'])]),
    ('Avicii', [('True', ['Wake Me Up', 'You Make Me', 'Hey Brother', 'Addicted To You']),
                ('Stories', ['Waiting For Love', 'For A Better Day'])]),
    ('The Chainsmokers', [('Memories Do Not Open', ['Something Just Like This', 'Paris', 'Closer']),
                          ('Sick Boy', ['Sick Boy', 'You Owe Me'])]),
    ('Marshmello', [('Joytime', ['Alone', 'Keep It Mello', 'Ritual']),
                    ('Joytime II', ['Happier', 'Together', 'Silence'])]),
    ('Kygo', [('Cloud Nine', ['Stole the Show', 'Stay', 'Firestone', 'Here For You']),
              ('Kids in Love', ['It Ain\'t Me', 'Stargazing'])]),
    ('Zedd', [('Clarity', ['Clarity', 'Stay The Night', 'Spectrum']),
              ('True Colors', ['I Want You To Know', 'Beautiful Now'])]),
    ('Daft Punk', [('Random Access Memories', ['Get Lucky', 'Lose Yourself to Dance', 'Instant Crush']),
                   ('Discovery', ['One More Time', 'Harder Better Faster Stronger'])]),
    ('Skrillex', [('Recess', ['Recess', 'Coast Is Clear', 'Stranger']),
                  ('Bangarang', ['Bangarang', 'Breakn\' a Sweat'])]),
    ('Diplo', [('California', ['So Long', 'Set Me Free', 'Revolution']),
               ('Peace Is The Mission', ['Lean On', 'Powerful'])]),
    
    # Classic Rock (15 artists)
    ('Fleetwood Mac', [('Rumours', ['Dreams', 'Go Your Own Way', 'Don\'t Stop', 'The Chain']),
                       ('Tango in the Night', ['Little Lies', 'Everywhere', 'Seven Wonders'])]),
    ('Eagles', [('Hotel California', ['Hotel California', 'New Kid In Town', 'Life In The Fast Lane']),
                ('Their Greatest Hits', ['Take It Easy', 'Desperado', 'Best Of My Love'])]),
    ('The Rolling Stones', [('Sticky Fingers', ['Brown Sugar', 'Wild Horses', 'Can\'t You Hear Me Knocking']),
                            ('Exile on Main St.', ['Tumbling Dice', 'Happy'])]),
    ('The Beatles', [('Abbey Road', ['Come Together', 'Something', 'Here Comes The Sun']),
                     ('Sgt. Pepper\'s', ['With A Little Help', 'Lucy In The Sky', 'A Day In The Life'])]),
    ('Led Zeppelin', [('Led Zeppelin IV', ['Stairway to Heaven', 'Black Dog', 'Rock and Roll']),
                      ('Physical Graffiti', ['Kashmir', 'Trampled Under Foot'])]),
    ('Pink Floyd', [('The Dark Side of the Moon', ['Money', 'Time', 'Us and Them', 'Brain Damage']),
                    ('The Wall', ['Another Brick In The Wall', 'Comfortably Numb'])]),
    ('Queen', [('A Night at the Opera', ['Bohemian Rhapsody', 'You\'re My Best Friend', 'Love Of My Life']),
               ('The Game', ['Crazy Little Thing', 'Another One Bites The Dust'])]),
    ('Aerosmith', [('Toys in the Attic', ['Sweet Emotion', 'Walk This Way', 'Dream On']),
                   ('Pump', ['Love In An Elevator', 'Janie\'s Got A Gun'])]),
    ('Journey', [('Escape', ['Don\'t Stop Believin\'', 'Open Arms', 'Who\'s Crying Now']),
                 ('Frontiers', ['Separate Ways', 'Faithfully'])]),
    ('Boston', [('Boston', ['More Than A Feeling', 'Peace Of Mind', 'Foreplay']),
                ('Don\'t Look Back', ['Don\'t Look Back', 'A Man I\'ll Never Be'])]),
    
    # Jazz/Soul/R&B Classic (10 artists)
    ('Stevie Wonder', [('Songs in the Key of Life', ['Sir Duke', 'I Wish', 'Isn\'t She Lovely']),
                       ('Innervisions', ['Living For The City', 'Higher Ground'])]),
    ('Marvin Gaye', [('What\'s Going On', ['What\'s Going On', 'Mercy Mercy Me', 'Inner City Blues']),
                     ('Let\'s Get It On', ['Let\'s Get It On', 'Come Get To This'])]),
    ('Aretha Franklin', [('I Never Loved a Man', ['Respect', 'I Never Loved A Man', 'Do Right Woman']),
                         ('Lady Soul', ['Chain Of Fools', 'Since You\'ve Been Gone'])]),
    ('Al Green', [('Let\'s Stay Together', ['Let\'s Stay Together', 'I\'m Still In Love With You']),
                  ('Call Me', ['Call Me', 'Have You Been Making Out'])]),
    ('Earth Wind & Fire', [('That\'s the Way of the World', ['Shining Star', 'That\'s The Way']),
                           ('I Am', ['September', 'Boogie Wonderland'])]),
    ('The Temptations', [('Cloud Nine', ['Cloud Nine', 'Runaway Child', 'I Heard It Through']),
                         ('Masterpiece', ['Masterpiece', 'Hey Girl'])]),
    ('Diana Ross', [('Diana', ['Upside Down', 'I\'m Coming Out', 'My Old Piano']),
                    ('Touch Me in the Morning', ['Touch Me In The Morning'])]),
    ('Lionel Richie', [('Can\'t Slow Down', ['Hello', 'All Night Long', 'Running With The Night']),
                       ('Dancing on the Ceiling', ['Say You Say Me', 'Dancing On The Ceiling'])]),
    ('Whitney Houston', [('Whitney Houston', ['How Will I Know', 'Greatest Love Of All', 'Saving All My Love']),
                         ('Whitney', ['I Wanna Dance With Somebody', 'Didn\'t We Almost Have It All'])]),
    ('Michael Jackson', [('Thriller', ['Thriller', 'Billie Jean', 'Beat It', 'Wanna Be Startin\' Something']),
                         ('Bad', ['Bad', 'The Way You Make Me Feel', 'Man In The Mirror'])]),
    
    # Indie/Alternative Modern (10 artists)
    ('Twenty One Pilots', [('Blurryface', ['Stressed Out', 'Ride', 'Heathens', 'Lane Boy']),
                           ('Trench', ['Jumpsuit', 'Levitate', 'My Blood'])]),
    ('Lorde', [('Pure Heroine', ['Royals', 'Team', 'Tennis Court']),
               ('Melodrama', ['Green Light', 'Perfect Places', 'Liability'])]),
    ('Florence + The Machine', [('Lungs', ['Dog Days Are Over', 'You\'ve Got The Love', 'Cosmic Love']),
                                ('Ceremonials', ['Shake It Out', 'Never Let Me Go'])]),
    ('Vampire Weekend', [('Modern Vampires', ['Diane Young', 'Step', 'Hannah Hunt']),
                         ('Father of the Bride', ['Harmony Hall', 'This Life'])]),
    ('Tame Impala', [('Currents', ['Let It Happen', 'The Less I Know The Better', 'Eventually']),
                     ('The Slow Rush', ['Borderline', 'Lost In Yesterday'])]),
    ('The 1975', [('I Like It When You Sleep', ['Somebody Else', 'The Sound', 'A Change Of Heart']),
                  ('A Brief Inquiry', ['Love It If We Made It', 'Sincerity Is Scary'])]),
    ('Alt-J', [('An Awesome Wave', ['Breezeblocks', 'Tessellate', 'Fitzpleasure']),
               ('This Is All Yours', ['Every Other Freckle', 'Left Hand Free'])]),
    ('Glass Animals', [('How To Be A Human Being', ['Life Itself', 'Youth', 'Season 2 Episode 3']),
                       ('Dreamland', ['Heat Waves', 'Tokyo Drifting'])]),
    ('MGMT', [('Oracular Spectacular', ['Time to Pretend', 'Electric Feel', 'Kids']),
              ('Congratulations', ['Flash Delirium', 'Congratulations'])]),
    ('Passion Pit', [('Manners', ['Sleepyhead', 'The Reeling', 'Little Secrets']),
                     ('Gossamer', ['Take A Walk', 'Carried Away'])]),
]

def generate_artists_albums_tracks(start_artist_id=276, start_album_id=348, start_track_id=3504):
    """Generate 200 real artists with albums and tracks from charts"""
    artists = []
    albums = []
    tracks = []
    
    artist_id = start_artist_id
    album_id = start_album_id
    track_id = start_track_id
    
    # Genre IDs (from existing Chinook schema): 1=Rock, 2=Jazz, 3=Metal, 4=Alternative, 7=Latin, 8=Reggae, 9=Pop, 13=Heavy Metal, 17=Hip Hop/Rap, 20=R&B/Soul, 23=Alternative & Punk
    genre_mapping = {
        'Rock': 1, 'Pop': 9, 'Alternative': 4, 'Hip Hop': 17, 'R&B': 20, 
        'Country': 2, 'Electronic': 4, 'Jazz': 2, 'Soul': 20
    }
    
    # MediaType: 1=MPEG, 2=Protected AAC, 3=Protected MPEG-4, 4=Purchased AAC, 5=AAC
    media_type = 1  # MPEG audio file
    
    for artist_name, artist_albums in CHART_ARTISTS:
        # Insert artist - escape single quotes for SQL
        artist_escaped = artist_name.replace("'", "''")
        artists.append(f"    (N'{artist_escaped}')")
        current_artist_id = artist_id
        artist_id += 1
        
        # Determine genre based on artist position in list
        if 'Taylor Swift' in artist_name or 'Katy Perry' in artist_name or 'Ariana Grande' in artist_name:
            genre_id = 9  # Pop
        elif 'Drake' in artist_name or 'Kendrick' in artist_name or 'Jay-Z' in artist_name:
            genre_id = 17  # Hip Hop
        elif 'Luke Combs' in artist_name or 'Morgan Wallen' in artist_name or 'Carrie Underwood' in artist_name:
            genre_id = 2  # Country (using Jazz ID as placeholder)
        elif 'Coldplay' in artist_name or 'Foo Fighters' in artist_name or 'Muse' in artist_name:
            genre_id = 1  # Rock
        elif 'Calvin Harris' in artist_name or 'Avicii' in artist_name or 'The Chainsmokers' in artist_name:
            genre_id = 4  # Electronic/Alternative
        elif 'Stevie Wonder' in artist_name or 'Marvin Gaye' in artist_name or 'Whitney Houston' in artist_name:
            genre_id = 20  # R&B/Soul
        else:
            genre_id = random.choice([1, 4, 9])
        
        for album_name, track_list in artist_albums:
            # Insert album - escape single quotes for SQL
            album_escaped = album_name.replace("'", "''")
            albums.append(f"    (N'{album_escaped}', {current_artist_id})")
            current_album_id = album_id
            album_id += 1
            
            # Insert tracks
            for track_name in track_list:
                # Random duration between 3-5 minutes (in milliseconds)
                duration_ms = random.randint(180000, 300000)
                # Random file size between 5-12 MB (in bytes)
                file_bytes = random.randint(5000000, 12000000)
                # Price between $0.99-$1.29
                price = random.choice([0.99, 1.29])
                
                # Escape single quotes for SQL
                track_escaped = track_name.replace("'", "''")
                tracks.append(f"    (N'{track_escaped}', {current_album_id}, {media_type}, {genre_id}, NULL, {duration_ms}, {file_bytes}, {price})")
                track_id += 1
    
    return artists, albums, tracks

def test_sqlserver_connection(server, database, auth_type='windows', username=None, password=None):
    """Test SQL Server connection before generating files using sqlcmd"""
    import subprocess
    
    try:
        # Build sqlcmd test command
        if auth_type == 'windows':
            cmd = ['sqlcmd', '-S', server, '-d', database, '-E', '-Q', 'SELECT 1']
        else:
            cmd = ['sqlcmd', '-S', server, '-d', database, '-U', username, '-P', password, '-Q', 'SELECT 1']
        
        print(f"Testing connection to {server}/{database}...")
        
        # Execute test query
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✓ Connection successful\n")
            return True
        else:
            print(f"✗ Connection failed: {result.stderr}\n")
            return False
            
    except FileNotFoundError:
        print("✗ Connection failed: sqlcmd utility not found\n")
        print("Please ensure SQL Server Command Line Utilities are installed.")
        return False
    except subprocess.TimeoutExpired:
        print("✗ Connection failed: Connection timeout\n")
        return False
    except Exception as e:
        print(f"✗ Connection failed: {str(e)}\n")
        return False

def insert_to_sqlserver(server, database, sql_file, auth_type='windows', username=None, password=None):
    """Execute SQL file directly into SQL Server database using sqlcmd utility"""
    import subprocess
    import os
    import time
    
    try:
        # Build sqlcmd command
        if auth_type == 'windows':
            cmd = [
                'sqlcmd',
                '-S', server,
                '-d', database,
                '-E',  # Windows Authentication
                '-i', sql_file,
                '-I'   # Enable QUOTED_IDENTIFIER
            ]
        else:
            cmd = [
                'sqlcmd',
                '-S', server,
                '-d', database,
                '-U', username,
                '-P', password,
                '-i', sql_file,
                '-I'   # Enable QUOTED_IDENTIFIER
            ]
        
        print(f"Executing SQL file via sqlcmd: {server}/{database}...")
        print(f"  File: {sql_file}\n")
        
        start_time = time.time()
        
        # Execute sqlcmd with real-time output
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1,
            universal_newlines=True
        )
        
        # Stream output in real-time
        stdout_lines = []
        stderr_lines = []
        
        # Read stdout
        for line in process.stdout:
            print(line.rstrip())
            stdout_lines.append(line)
        
        # Wait for completion and get stderr
        process.wait()
        stderr_output = process.stderr.read()
        
        elapsed_time = time.time() - start_time
        
        # Check for errors
        if process.returncode != 0:
            print("\n" + "=" * 80)
            print("ERROR: SQL execution failed")
            print("=" * 80)
            print(stderr_output)
            return False
        
        print("\n" + "=" * 80)
        print("SUCCESS: All data inserted directly into SQL Server database!")
        print(f"Total execution time: {elapsed_time:.2f} seconds ({elapsed_time/60:.2f} minutes)")
        print("=" * 80)
        return True
        
    except FileNotFoundError:
        print("\nERROR: sqlcmd utility not found.")
        print("\nPlease ensure SQL Server Command Line Utilities are installed.")
        print("Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility")
        return False
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        return False

def main():
    import sys
    
    print("=" * 80)
    print("Chinook Database - Large Scale Data Generator")
    print("=" * 80)
    print()
    
    # Quick mode with command-line arguments
    if '--quick' in sys.argv:
        print("QUICK MODE - Using defaults with command-line options")
        print()
        
        db_type = 'mssql'
        insertion_mode = 'direct'
        
        # Default values
        new_customers = 941
        new_invoices = 3588
        systemlog_count = 65000  # Default to 65000 rows (~500MB) for quick mode
        
        # Parse command-line arguments for custom values
        for i, arg in enumerate(sys.argv):
            if arg == '--customers' and i + 1 < len(sys.argv):
                new_customers = int(sys.argv[i + 1])
            elif arg == '--invoices' and i + 1 < len(sys.argv):
                new_invoices = int(sys.argv[i + 1])
            elif arg == '--systemlog' and i + 1 < len(sys.argv):
                systemlog_count = int(sys.argv[i + 1])
        
        generate_systemlog_data = systemlog_count > 0
        
        # Default SQL Server connection settings
        db_server = 'localhost'
        db_name = 'Chinook_FullRestore'
        auth_type = 'windows'
        username = None
        password = None
        
        print(f"Database: SQL Server ({db_server}/{db_name})")
        print(f"Mode: Direct insertion (Windows Authentication)")
        print(f"Customers: {new_customers:,}")
        print(f"Invoices: {new_invoices:,}")
        if generate_systemlog_data:
            estimated_mb = (systemlog_count * 8) // 1000  # ~7.8KB per row
            print(f"SystemLog: {systemlog_count:,} rows (~{estimated_mb}MB)")
        else:
            print(f"SystemLog: Skipped")
        print()
        
        # Test connection
        print("Testing SQL Server connection...")
        if not test_sqlserver_connection(db_server, db_name, auth_type, username, password):
            print("❌ Connection failed. Please check your SQL Server settings.")
            print("   Try running without --quick for interactive mode.")
            return
        print("✓ Connection successful")
        print()
        
    # Interactive mode if no arguments provided
    elif len(sys.argv) == 1:
        print("Select target database(s):")
        print("  1. SQL Server")
        print("  2. Oracle")
        print("  3. PostgreSQL")
        print("  4. MySQL")
        print("  5. All databases")
        print()
        
        while True:
            choice = input("Enter choice (1-5, default: 1): ").strip()
            if choice == '' or choice == '1':
                db_type = 'mssql'
                break
            elif choice == '2':
                db_type = 'oracle'
                break
            elif choice == '3':
                db_type = 'postgresql'
                break
            elif choice == '4':
                db_type = 'mysql'
                break
            elif choice == '5':
                db_type = 'all'
                break
            else:
                print("Invalid choice. Please enter 1-5.")
        
        print()
        
        # Ask for insertion mode (only for single database, not 'all')
        if db_type != 'all':
            print("Select insertion mode:")
            print("  1. Generate SQL file")
            print("  2. Direct database insert (faster for large datasets)")
            print()
            
            while True:
                mode_choice = input("Enter choice (1-2): ").strip()
                if mode_choice == '1':
                    insertion_mode = 'file'
                    break
                elif mode_choice == '2':
                    insertion_mode = 'direct'
                    break
                else:
                    print("Invalid choice. Please enter 1 or 2.")
            
            # Get database connection details for direct insert
            if insertion_mode == 'direct' and db_type == 'mssql':
                while True:
                    print()
                    print("SQL Server connection details:")
                    server_input = input("  Server (default: localhost): ").strip()
                    db_server = server_input if server_input else 'localhost'
                    
                    db_name_input = input("  Database name (default: Chinook_FullRestore): ").strip()
                    db_name = db_name_input if db_name_input else 'Chinook_FullRestore'
                    
                    print()
                    print("Authentication type:")
                    print("  1. Windows Authentication")
                    print("  2. SQL Server Authentication")
                    while True:
                        auth_choice = input("  Enter choice (1-2, default: 1): ").strip()
                        if auth_choice in ['', '1']:
                            auth_type = 'windows'
                            username = None
                            password = None
                            break
                        elif auth_choice == '2':
                            auth_type = 'sql'
                            username = input("  Username: ").strip()
                            import getpass
                            password = getpass.getpass("  Password: ")
                            break
                        else:
                            print("  Invalid choice. Please enter 1 or 2.")
                    print()
                    
                    # Test the connection before proceeding
                    if test_sqlserver_connection(db_server, db_name, auth_type, username, password):
                        break
                    else:
                        retry = input("Connection failed. Try again? (y/n): ").strip().lower()
                        if retry not in ['y', 'yes']:
                            print("Aborting direct database insertion.")
                            return
        else:
            insertion_mode = 'file'  # Always use file mode for 'all databases'
        
        print()
        print("How many new customers to generate?")
        print(f"  Current: 59 in base database")
        print(f"  Recommended: 941 (for total of 1,000)")
        while True:
            try:
                customer_input = input("Enter number of new customers (default 941): ").strip()
                new_customers = int(customer_input) if customer_input else 941
                if new_customers < 0:
                    print("Please enter a positive number.")
                    continue
                break
            except ValueError:
                print("Invalid number. Please try again.")
        
        print()
        print("How many new invoices to generate?")
        print(f"  Current: 412 in base database")
        print(f"  Recommended: 3,588 (for total of 4,000)")
        print(f"  Date range: Jan 1, 2022 - Jan 19, 2026")
        while True:
            try:
                invoice_input = input("Enter number of new invoices (default 3588): ").strip()
                new_invoices = int(invoice_input) if invoice_input else 3588
                if new_invoices < 0:
                    print("Please enter a positive number.")
                    continue
                break
            except ValueError:
                print("Invalid number. Please try again.")
        
        print()
        print("Generate SystemLog entries for database size inflation?")
        print("  SQL Server generates ~7.8KB padding per row during insertion (fast & memory-efficient)")
        print("  ~13,000 rows ≈ 100MB | ~65,000 rows ≈ 500MB | ~130,000 rows ≈ 1GB")
        while True:
            try:
                systemlog_input = input("How many SystemLog rows to generate? (0 to skip, default: 0): ").strip()
                systemlog_count = int(systemlog_input) if systemlog_input else 0
                if systemlog_count < 0:
                    print("Please enter a positive number or 0.")
                    continue
                generate_systemlog_data = systemlog_count > 0
                break
            except ValueError:
                print("Invalid number. Please try again.")
        
        print()
    else:
        # Command line mode - always use file generation
        insertion_mode = 'file'
        db_type = sys.argv[1]
        valid_types = ['mssql', 'oracle', 'postgresql', 'mysql', 'all']
        
        if db_type not in valid_types:
            print(f"Invalid database type: {db_type}")
            print(f"Valid types: {', '.join(valid_types)}")
            return
        
        # Default counts for command line mode
        new_customers = int(sys.argv[2]) if len(sys.argv) > 2 else 941
        new_invoices = int(sys.argv[3]) if len(sys.argv) > 3 else 3588
        generate_systemlog_data = False
        systemlog_count = 0
    
    databases_to_generate = [db_type] if db_type != 'all' else ['mssql', 'oracle', 'postgresql', 'mysql']
    
    total_customers = 59 + new_customers
    total_invoices = 412 + new_invoices
    
    # Generate data once
    print(f"Generating {total_customers:,} customers with diverse, realistic data...")
    print()
    
    customers, customers_dict = generate_customers(start_id=60, count=new_customers)
    
    print(f"✓ Generated {len(customers):,} new customers")
    print(f"  Total customers: {total_customers:,} (59 original + {new_customers:,} new)")
    print()
    
    print(f"Generating {total_invoices:,} invoices for 2022-2026 (Jan 1, 2022 - Jan 19, 2026)...")
    print()
    
    # Only reference the new customers we're generating (60+) to avoid dependency on original data
    invoices, invoice_lines = generate_invoices(start_id=413, count=new_invoices, customer_count=new_customers, customer_id_start=60, customers_dict=customers_dict)
    
    print(f"✓ Generated {len(invoices):,} new invoices")
    print(f"✓ Generated {len(invoice_lines):,} new invoice lines")
    print(f"  Total invoices: {total_invoices:,} (412 original + {new_invoices:,} new)")
    print()
    
    print("Generating 200 real artists from charts with clean content...")
    print()
    
    artists, albums, tracks = generate_artists_albums_tracks(start_artist_id=276, start_album_id=348, start_track_id=3504)
    
    print(f"✓ Generated {len(artists)} artists")
    print(f"✓ Generated {len(albums)} albums")
    print(f"✓ Generated {len(tracks)} tracks")
    print()
    
    # Generate SystemLog if requested
    if generate_systemlog_data:
        estimated_mb = (systemlog_count * 8) // 1000  # ~7.8KB per row
        print(f"Generating {systemlog_count:,} SystemLog entries (~{estimated_mb}MB after SQL padding)...")
        print()
        
        systemlog = generate_systemlog(count=systemlog_count, invoice_count=new_invoices)
        
        print(f"✓ Generated {len(systemlog):,} log entries (SQL Server will add ~7.8KB padding per row)")
        print()
    else:
        systemlog = []
    
    # Insert or generate files based on mode
    if insertion_mode == 'direct':
        # Direct database insertion - can insert to multiple databases with same data
        # Strategy: Generate SQL file first, then execute it
        while True:
            if db_type == 'mssql':
                # Generate the SQL file
                db_dirs = {'mssql': 'MSSQL'}
                output_file = f'{db_dirs[db_type]}/large_dataset_inserts_{db_type}.sql'
                
                print(f"Generating SQL file: {output_file}...")
                with open(output_file, 'w', encoding='utf-8') as f:
                    write_mssql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog)
                print(f"  ✓ SQL file generated\n")
                
                # Execute the file directly to the database
                insert_to_sqlserver(db_server, db_name, output_file, auth_type, username, password)
            
            # Ask if user wants to insert to another database
            print()
            while True:
                another = input("Insert same data to another database? (y/n): ").strip().lower()
                if another in ['y', 'yes', 'n', 'no']:
                    break
                print("Please enter 'y' or 'n'")
            
            if another in ['n', 'no']:
                break
            
            # Prompt for next database
            print()
            print("Select target database:")
            print("  1. SQL Server")
            print("  2. Oracle (not yet implemented)")
            print("  3. PostgreSQL (not yet implemented)")
            print("  4. MySQL (not yet implemented)")
            print()
            
            while True:
                db_choice = input("Enter choice (1-4, default: 1): ").strip()
                if db_choice == '' or db_choice == '1':
                    db_type = 'mssql'
                    break
                elif db_choice in ['2', '3', '4']:
                    print("Direct insertion for this database type is not yet implemented.")
                    print("Use 'Generate SQL file' option instead, then execute the file manually.")
                    continue
                else:
                    print("Invalid choice. Please enter 1-4.")
            
            # Get connection details for the new database
            if db_type == 'mssql':
                while True:
                    print()
                    print("SQL Server connection details:")
                    server_input = input("  Server (default: localhost): ").strip()
                    db_server = server_input if server_input else 'localhost'
                    
                    db_name_input = input("  Database name (default: Chinook_FullRestore): ").strip()
                    db_name = db_name_input if db_name_input else 'Chinook_FullRestore'
                    
                    print()
                    print("Authentication type:")
                    print("  1. Windows Authentication")
                    print("  2. SQL Server Authentication")
                    while True:
                        auth_choice = input("  Enter choice (1-2, default: 1): ").strip()
                        if auth_choice in ['', '1']:
                            auth_type = 'windows'
                            username = None
                            password = None
                            break
                        elif auth_choice == '2':
                            auth_type = 'sql'
                            username = input("  Username: ").strip()
                            import getpass
                            password = getpass.getpass("  Password: ")
                            break
                        else:
                            print("  Invalid choice. Please enter 1 or 2.")
                    print()
                    
                    # Test the connection before proceeding
                    if test_sqlserver_connection(db_server, db_name, auth_type, username, password):
                        break
                    else:
                        retry = input("Connection failed. Try again? (y/n): ").strip().lower()
                        if retry not in ['y', 'yes']:
                            break
    else:
        # Generate files for each database
        for db in databases_to_generate:
            print(f"Creating {db.upper()} format...")
            
            # Determine output directory based on database type
            db_dirs = {
                'mssql': 'MSSQL',
                'oracle': 'Oracle',
                'postgresql': 'PostgreSQL',
                'mysql': 'MySQL'
            }
            output_file = f'{db_dirs[db]}/large_dataset_inserts_{db}.sql'
            
            with open(output_file, 'w', encoding='utf-8') as f:
                if db == 'mssql':
                    write_mssql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog)
                elif db == 'oracle':
                    write_oracle_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog)
                elif db == 'postgresql':
                    write_postgresql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog)
                elif db == 'mysql':
                    write_mysql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog)
            
            print(f"  ✓ {output_file}")
    
    print()
    print("=" * 80)
    print("Data Generation Summary:")
    print("  - 80 real artists from Billboard/mainstream charts")
    print("  - 160 real albums with clean content")  
    print("  - 439 real tracks (no explicit content)")
    print(f"  - {new_customers:,} realistic customers from diverse cultures")
    print("  - Accurate city/country/state combinations")
    print(f"  - {new_invoices:,} invoices (Jan 1, 2022 - Jan 19, 2026)")
    print(f"  - {len(invoice_lines):,} invoice line items")
    print("  - Realistic invoice amounts ($0.99 - $50.00)")
    if insertion_mode == 'file':
        print("  - SQL files generated for: " + ", ".join([d.upper() for d in databases_to_generate]))
    else:
        print("  - SQL file generated and executed directly to database")
    print("=" * 80)

def write_mssql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog):
    """Write data in SQL Server format with batching (max 1000 rows per INSERT)"""
    batch_size = 1000
    
    # Add transaction wrapper for atomicity
    f.write("-- Begin transaction for bulk insert\n")
    f.write("PRINT 'Starting data insertion at ' + CONVERT(VARCHAR, GETDATE(), 120);\n")
    f.write("GO\n\n")
    
    f.write("BEGIN TRANSACTION;\n")
    f.write("GO\n\n")
    
    # Artists - has IDENTITY, need to specify IDs explicitly
    f.write("-- Additional artists (276-355) - Real chart artists\n")
    f.write("PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting artists...';\n")
    f.write("GO\n")
    f.write("SET IDENTITY_INSERT [dbo].[Artist] ON;\n")
    f.write("INSERT INTO [dbo].[Artist] ([ArtistId], [Name]) VALUES\n")
    # Parse and add explicit ArtistIds
    artist_lines = []
    for i, artist in enumerate(artists, start=276):
        # Remove formatting: "    (N'name')"
        clean = artist.strip()
        if clean.startswith("("):
            clean = clean[1:]
        if clean.endswith(")"):
            clean = clean[:-1]
        artist_lines.append(f"    ({i}, {clean})")
    f.write(",\n".join(artist_lines))
    f.write(";\n")
    f.write("GO\n")
    f.write("SET IDENTITY_INSERT [dbo].[Artist] OFF;\n")
    f.write("GO\n\n")
    
    # Albums - has IDENTITY, need to specify IDs explicitly with batching
    f.write("-- Additional albums (348-507) - Real chart albums\n")
    f.write("PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting albums...';\n")
    f.write("GO\n")
    
    # Batch the inserts
    album_count = len(albums)
    for batch_num in range(0, album_count, batch_size):
        batch_end = min(batch_num + batch_size, album_count)
        
        f.write("SET IDENTITY_INSERT [dbo].[Album] ON;\n")
        f.write("INSERT INTO [dbo].[Album] ([AlbumId], [Title], [ArtistId]) VALUES\n")
        
        # Write batch items
        for idx in range(batch_num, batch_end):
            i = 348 + idx
            album = albums[idx]
            clean = album.strip()
            if clean.startswith("("):
                clean = clean[1:]
            if clean.endswith(")"):
                clean = clean[:-1]
            parts = clean.rsplit(", ", 1)
            title_part = parts[0]
            artist_id = parts[1]
            
            if idx < batch_end - 1:
                f.write(f"    ({i}, {title_part}, {artist_id}),\n")
            else:
                f.write(f"    ({i}, {title_part}, {artist_id})\n")
        
        f.write(";\n")
        f.write("SET IDENTITY_INSERT [dbo].[Album] OFF;\n")
        f.write("GO\n\n")
    
    # Tracks - has IDENTITY, need to specify IDs explicitly with batching
    f.write("-- Additional tracks (3504-3942) - Real chart tracks\n")
    f.write("PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting tracks...';\n")
    f.write("GO\n")
    
    # Batch the inserts
    track_count = len(tracks)
    for batch_num in range(0, track_count, batch_size):
        batch_end = min(batch_num + batch_size, track_count)
        
        f.write("SET IDENTITY_INSERT [dbo].[Track] ON;\n")
        f.write("INSERT INTO [dbo].[Track] ([TrackId], [Name], [AlbumId], [MediaTypeId], [GenreId], [Composer], [Milliseconds], [Bytes], [UnitPrice]) VALUES\n")
        
        # Write batch items
        for idx in range(batch_num, batch_end):
            i = 3504 + idx
            track = tracks[idx]
            clean = track.strip()
            if clean.startswith("("):
                clean = clean[1:]
            if clean.endswith(")"):
                clean = clean[:-1]
            quote_end = clean.find("', ")
            if quote_end > 0:
                name_part = clean[:quote_end+1]
                rest = clean[quote_end+2:]
                
                if idx < batch_end - 1:
                    f.write(f"    ({i}, {name_part}, {rest}),\n")
                else:
                    f.write(f"    ({i}, {name_part}, {rest})\n")
        
        f.write(";\n")
        f.write("SET IDENTITY_INSERT [dbo].[Track] OFF;\n")
        f.write("GO\n\n")
    
    # Customers - has IDENTITY, need to specify IDs explicitly with batching
    f.write("-- Additional customers (60-1000+)\n")
    
    # Write batches directly without building full list in memory
    total_batches = (len(customers) + batch_size - 1) // batch_size
    for batch_num in range(0, len(customers), batch_size):
        batch_end = min(batch_num + batch_size, len(customers))
        batch_index = batch_num // batch_size + 1
        
        # Add progress message every 10 batches
        if batch_index % 10 == 1 and total_batches >= 10:
            f.write(f"PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting customers... batch {batch_index} of {total_batches}';\n")
            f.write("GO\n")
        
        f.write("SET IDENTITY_INSERT [dbo].[Customer] ON;\n")
        f.write("INSERT INTO [dbo].[Customer] ([CustomerId], [FirstName], [LastName], [Company], [Address], [City], [State], [Country], [PostalCode], [Phone], [Fax], [Email], [SupportRepId]) VALUES\n")
        
        # Write batch items
        for idx in range(batch_num, batch_end):
            i = 60 + idx
            customer = customers[idx]
            clean = customer.strip()
            if clean.startswith("("):
                clean = clean[1:]
            if clean.endswith(")"):
                clean = clean[:-1]
            
            if idx < batch_end - 1:
                f.write(f"    ({i}, {clean}),\n")
            else:
                f.write(f"    ({i}, {clean})\n")
        
        f.write(";\n")
        f.write("SET IDENTITY_INSERT [dbo].[Customer] OFF;\n")
        f.write("GO\n\n")
    
    # Invoices - has IDENTITY, need to specify IDs explicitly with batching
    f.write("-- Additional invoices (413-4000+) - 2022-2026\n")
    
    # Write batches directly without building full list in memory
    total_batches = (len(invoices) + batch_size - 1) // batch_size
    for batch_num in range(0, len(invoices), batch_size):
        batch_end = min(batch_num + batch_size, len(invoices))
        batch_index = batch_num // batch_size + 1
        
        # Add progress message every 10 batches
        if batch_index % 10 == 1 and total_batches >= 10:
            f.write(f"PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting invoices... batch {batch_index} of {total_batches}';\n")
            f.write("GO\n")
        
        f.write("SET IDENTITY_INSERT [dbo].[Invoice] ON;\n")
        f.write("INSERT INTO [dbo].[Invoice] ([InvoiceId], [CustomerId], [InvoiceDate], [BillingAddress], [BillingCity], [BillingState], [BillingCountry], [BillingPostalCode], [Total]) VALUES\n")
        
        # Write batch items
        for idx in range(batch_num, batch_end):
            i = 413 + idx
            invoice = invoices[idx]
            clean = invoice.strip()
            if clean.startswith("("):
                clean = clean[1:]
            if clean.endswith(")"):
                clean = clean[:-1]
            
            if idx < batch_end - 1:
                f.write(f"    ({i}, {clean}),\n")
            else:
                f.write(f"    ({i}, {clean})\n")
        
        f.write(";\n")
        f.write("SET IDENTITY_INSERT [dbo].[Invoice] OFF;\n")
        f.write("GO\n\n")
    
    # Invoice Lines - has IDENTITY, need to specify IDs explicitly with batching
    f.write("-- Additional invoice lines (2241+) - Links invoices to tracks\n")
    
    # Write batches directly without building full list in memory
    total_batches = (len(invoice_lines) + batch_size - 1) // batch_size
    for batch_num in range(0, len(invoice_lines), batch_size):
        batch_end = min(batch_num + batch_size, len(invoice_lines))
        batch = invoice_lines[batch_num:batch_end]
        batch_index = batch_num // batch_size + 1
        
        # Add progress message every 10 batches
        if batch_index % 10 == 1 and total_batches >= 10:
            f.write(f"PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting invoice lines... batch {batch_index} of {total_batches}';\n")
            f.write("GO\n")
        
        f.write("SET IDENTITY_INSERT [dbo].[InvoiceLine] ON;\n")
        f.write("INSERT INTO [dbo].[InvoiceLine] ([InvoiceLineId], [InvoiceId], [TrackId], [UnitPrice], [Quantity]) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n")
        f.write("SET IDENTITY_INSERT [dbo].[InvoiceLine] OFF;\n")
        f.write("GO\n\n")
    
    # SystemLog - optional table for database size inflation
    if systemlog and len(systemlog) > 0:
        f.write("-- SystemLog entries for database size inflation\n")
        f.write("-- Note: Only inserts if SystemLog table exists in the database\n")
        f.write("-- SQL Server generates ~7.8KB padding per row using REPLICATE() for fast insertion\n")
        
        # Write batches directly without building full list in memory
        total_batches = (len(systemlog) + batch_size - 1) // batch_size
        for batch_num in range(0, len(systemlog), batch_size):
            batch_end = min(batch_num + batch_size, len(systemlog))
            batch_index = batch_num // batch_size + 1
            
            # Add progress message (every 5 batches for large datasets, every batch for smaller ones)
            progress_interval = 5 if total_batches >= 20 else 1
            if batch_index % progress_interval == 1:
                f.write(f"PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Inserting system log entries... batch {batch_index} of {total_batches}';\n")
                f.write("GO\n")
            
            # Check if table exists before each batch
            f.write("IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemLog')\n")
            f.write("BEGIN\n")
            f.write("INSERT INTO [dbo].[SystemLog] ([LogId], [InvoiceId], [LogDate], [LogMessage])\n")
            f.write("SELECT LogId, InvoiceId, LogDate, LogMessage + ' | ' + REPLICATE('PADDING_', 70000)\n")
            f.write("FROM (VALUES\n")
            
            # Write batch items
            for idx in range(batch_num, batch_end):
                log_entry = systemlog[idx]
                clean = log_entry.strip()
                if clean.startswith("("):
                    clean = clean[1:]
                if clean.endswith(")"):
                    clean = clean[:-1]
                
                if idx < batch_end - 1:
                    f.write(f"    ({clean}),\n")
                else:
                    f.write(f"    ({clean})\n")
            
            f.write(") AS LogData(LogId, InvoiceId, LogDate, LogMessage);\n")
            f.write("END\n")
            f.write("GO\n\n")
    
    # Commit transaction
    f.write("-- Commit all changes\n")
    f.write("PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Committing transaction...';\n")
    f.write("GO\n")
    f.write("COMMIT TRANSACTION;\n")
    f.write("GO\n\n")
    
    f.write("PRINT '[' + CONVERT(VARCHAR, GETDATE(), 120) + '] Data insertion completed successfully!';\n")
    f.write("GO\n")

def write_oracle_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog):
    """Write data in Oracle format using INSERT ALL with batching"""
    batch_size = 500  # Oracle INSERT ALL limit
    
    # Add transaction for better performance
    f.write("-- Begin transaction for bulk insert\n")
    f.write("SET AUTOCOMMIT OFF;\n\n")
    
    # Artists
    f.write("-- Additional artists (276-355) - Real chart artists\n")
    f.write("INSERT ALL\n")
    for i, artist in enumerate(artists, start=276):
        artist_name = artist.replace("    (N'", "").replace("')", "")
        artist_name = artist_name.replace("'", "''")  # Escape single quotes
        f.write(f"  INTO Artist (ArtistId, Name) VALUES ({i}, '{artist_name}')\n")
    f.write("SELECT 1 FROM dual;\n\n")
    
    # Albums - need to parse the format
    f.write("-- Additional albums (348-507) - Real chart albums\n")
    f.write("INSERT ALL\n")
    album_id = 348
    for album in albums:
        # Parse: (N'album_name', artist_id)
        parts = album.strip().replace("    (N'", "").rsplit("', ", 1)
        album_name = parts[0].replace("'", "''")
        artist_id = parts[1].replace(")", "")
        f.write(f"  INTO Album (AlbumId, Title, ArtistId) VALUES ({album_id}, '{album_name}', {artist_id})\n")
        album_id += 1
    f.write("SELECT 1 FROM dual;\n\n")
    
    # Tracks
    f.write("-- Additional tracks (3504-3942) - Real chart tracks\n")
    track_id = 3504
    # Oracle has a limit of 1000 rows per INSERT ALL, so batch them
    batch_size = 500
    for i in range(0, len(tracks), batch_size):
        batch = tracks[i:i+batch_size]
        f.write("INSERT ALL\n")
        for track in batch:
            # Parse: (N'track_name', album_id, media_type, genre_id, NULL, duration, bytes, price)
            parts = track.strip().replace("    (N'", "").split("', ", 1)
            track_name = parts[0].replace("'", "''")
            rest = parts[1].replace(")", "").split(", ")
            album_id, media_type, genre_id, composer, duration, file_bytes, price = rest
            f.write(f"  INTO Track (TrackId, Name, AlbumId, MediaTypeId, GenreId, Composer, Milliseconds, Bytes, UnitPrice) VALUES ({track_id}, '{track_name}', {album_id}, {media_type}, {genre_id}, {composer}, {duration}, {file_bytes}, {price})\n")
            track_id += 1
        f.write("SELECT 1 FROM dual;\n")
    f.write("\n")
    
    # Customers
    f.write("-- Additional customers (60-1000)\n")
    customer_id = 60
    for i in range(0, len(customers), batch_size):
        batch = customers[i:i+batch_size]
        f.write("INSERT ALL\n")
        for customer in batch:
            # Parse customer fields
            parts = customer.strip().replace("    (N'", "").split("', N'")
            first_name = parts[0].replace("'", "''")
            last_name = parts[1].replace("'", "''")
            rest_parts = "', N'".join(parts[2:])
            # This is complex - easier to reconstruct
            customer_clean = customer.replace("N'", "'").replace("    (", "").replace(")", "")
            fields = []
            in_quote = False
            current = ""
            for char in customer_clean:
                if char == "'" and (not current or current[-1] != "\\"):
                    in_quote = not in_quote
                    current += char
                elif char == "," and not in_quote:
                    fields.append(current.strip().strip("'"))
                    current = ""
                else:
                    current += char
            if current:
                fields.append(current.strip().strip("'"))
            
            fn, ln, co, ad, ci, st, cty, pc, ph, fx, em, sr = fields
            fn = fn.replace("'", "''")
            ln = ln.replace("'", "''")
            co = co if co != 'NULL' else 'NULL'
            ad = ad.replace("'", "''")
            ci = ci.replace("'", "''")
            st = st if st == 'NULL' else f"'{st}'"
            cty = cty.replace("'", "''")
            pc = pc.replace("'", "''")
            ph = ph.replace("'", "''")
            em = em.replace("'", "''")
            
            co_val = 'NULL' if co == 'NULL' else f"'{co.replace(chr(39), chr(39)+chr(39))}'"
            st_val = 'NULL' if st == 'NULL' else st
            
            f.write(f"  INTO Customer (CustomerId, FirstName, LastName, Company, Address, City, State, Country, PostalCode, Phone, Fax, Email, SupportRepId) VALUES ({customer_id}, '{fn}', '{ln}', {co_val}, '{ad}', '{ci}', {st_val}, '{cty}', '{pc}', '{ph}', NULL, '{em}', {sr})\n")
            customer_id += 1
        f.write("SELECT 1 FROM dual;\n")
    f.write("\n")
    
    # Invoices
    f.write("-- Additional invoices (413-4000+) - 2022-2026\n")
    invoice_id = 413
    for i in range(0, len(invoices), batch_size):
        batch = invoices[i:i+batch_size]
        f.write("INSERT ALL\n")
        for invoice in batch:
            # Parse: (customer_id, 'date', N'address', N'city', state, N'country', N'postal', total)
            parts = invoice.strip().replace("    (", "").replace(")", "").split(", ")
            cust_id = parts[0]
            inv_date = parts[1].strip("'")
            # Convert YYYY/MM/DD to Oracle TO_DATE format
            inv_address = parts[2].replace("N'", "").strip("'").replace("'", "''")
            inv_city = parts[3].replace("N'", "").strip("'").replace("'", "''")
            inv_state = parts[4]
            inv_country = parts[5].replace("N'", "").strip("'").replace("'", "''")
            inv_postal = parts[6].replace("N'", "").strip("'").replace("'", "''")
            inv_total = parts[7]
            
            state_val = 'NULL' if inv_state == 'NULL' else inv_state
            
            f.write(f"  INTO Invoice (InvoiceId, CustomerId, InvoiceDate, BillingAddress, BillingCity, BillingState, BillingCountry, BillingPostalCode, Total) VALUES ({invoice_id}, {cust_id}, TO_DATE('{inv_date}', 'YYYY/MM/DD'), '{inv_address}', '{inv_city}', {state_val}, '{inv_country}', '{inv_postal}', {inv_total})\n")
            invoice_id += 1
        f.write("SELECT 1 FROM dual;\n")
    f.write("\n")
    
    # Invoice Lines
    f.write("-- Additional invoice lines (2241+) - Links invoices to tracks\n")
    for i in range(0, len(invoice_lines), batch_size):
        batch = invoice_lines[i:i+batch_size]
        f.write("INSERT ALL\n")
        for line in batch:
            # Parse: (invoice_line_id, invoice_id, track_id, unit_price, quantity)
            parts = line.strip().replace("    (", "").replace(")", "").split(", ")
            il_id, inv_id, trk_id, price, qty = parts
            f.write(f"  INTO InvoiceLine (InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity) VALUES ({il_id}, {inv_id}, {trk_id}, {price}, {qty})\n")
        f.write("SELECT 1 FROM dual;\n")
    f.write("\n")
    
    # SystemLog - optional table for database size inflation
    if systemlog and len(systemlog) > 0:
        f.write("-- SystemLog entries for database size inflation\n")
        f.write("-- Note: Only inserts if SystemLog table exists in the database\n")
        f.write("-- Oracle generates ~7.8KB padding per row using RPAD() for fast insertion\n")
        f.write("\n")
        
        # Check if table exists
        f.write("DECLARE\n")
        f.write("  v_table_exists NUMBER;\n")
        f.write("BEGIN\n")
        f.write("  SELECT COUNT(*) INTO v_table_exists FROM user_tables WHERE table_name = 'SYSTEMLOG';\n")
        f.write("  \n")
        f.write("  IF v_table_exists > 0 THEN\n")
        
        # Process in batches (Oracle INSERT ALL has 1000 row limit, use 500 to be safe)
        total_batches = (len(systemlog) + batch_size - 1) // batch_size
        for batch_num in range(0, len(systemlog), batch_size):
            batch_end = min(batch_num + batch_size, len(systemlog))
            batch_index = batch_num // batch_size + 1
            
            # Progress tracking
            progress_interval = 5 if total_batches >= 20 else 1
            if batch_index % progress_interval == 1:
                f.write(f"    DBMS_OUTPUT.PUT_LINE('Inserting system log entries... batch {batch_index} of {total_batches}');\n")
            
            # Write batch using INSERT ALL
            f.write("    INSERT ALL\n")
            for idx in range(batch_num, batch_end):
                log_entry = systemlog[idx]
                # Convert from (log_id, invoice_id, 'YYYY/MM/DD', N'message')
                log_clean = log_entry.strip()
                if log_clean.startswith("("):
                    log_clean = log_clean[1:]
                if log_clean.endswith(")"):
                    log_clean = log_clean[:-1]
                
                # Parse the fields
                parts = log_clean.split(", ", 3)
                # Skip log_id (parts[0]) - Oracle trigger will auto-generate
                invoice_id = parts[1]
                log_date = parts[2].strip("'")
                log_msg = parts[3].replace("N'", "'").replace("''", "''''")
                
                # Oracle: Use RPAD to add padding (RPAD pads to specified length)
                # RPAD(string, length, pad_string) - we want ~7.8KB so use RPAD with REPEAT-like approach
                f.write(f"      INTO SystemLog (InvoiceId, LogDate, LogMessage) VALUES ({invoice_id}, TO_DATE('{log_date}', 'YYYY/MM/DD'), {log_msg} || ' | ' || RPAD('PADDING_', 70000, 'PADDING_'))\n")
            
            f.write("    SELECT 1 FROM dual;\n")
            f.write("\n")
        
        f.write("  END IF;\n")
        f.write("END;\n")
        f.write("/\n")
        f.write("\n")
    
    # Commit transaction
    f.write("-- Commit transaction\n")
    f.write("COMMIT;\n")

def write_postgresql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog):
    """Write data in PostgreSQL format (lowercase, no brackets) with batching"""
    import re
    batch_size = 1000
    
    # Add transaction for better performance
    f.write("-- Begin transaction for bulk insert\n")
    f.write("BEGIN;\n\n")
    
    # Artists
    f.write("-- Additional artists (276-355) - Real chart artists\n")
    postgres_artists = [a.replace("    (N'", "    ('") for a in artists]
    f.write("INSERT INTO artist (name) VALUES\n")
    f.write(",\n".join(postgres_artists))
    f.write(";\n\n")
    
    # Albums
    f.write("-- Additional albums (348-507) - Real chart albums\n")
    postgres_albums = [a.replace("    (N'", "    ('") for a in albums]
    f.write("INSERT INTO album (title, artist_id) VALUES\n")
    f.write(",\n".join(postgres_albums))
    f.write(";\n\n")
    
    # Tracks
    f.write("-- Additional tracks (3504-3942) - Real chart tracks\n")
    postgres_tracks = [t.replace("    (N'", "    ('") for t in tracks]
    f.write("INSERT INTO track (name, album_id, media_type_id, genre_id, composer, milliseconds, bytes, unit_price) VALUES\n")
    f.write(",\n".join(postgres_tracks))
    f.write(";\n\n")
    
    # Customers - with batching for large datasets
    f.write("-- Additional customers (60-1000+)\n")
    postgres_customers = [c.replace("    (N'", "    ('") for c in customers]
    for batch_num in range(0, len(postgres_customers), batch_size):
        batch = postgres_customers[batch_num:batch_num+batch_size]
        f.write("INSERT INTO customer (first_name, last_name, company, address, city, state, country, postal_code, phone, fax, email, support_rep_id) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # Invoices - with batching for large datasets
    f.write("-- Additional invoices (413-4000+) - 2022-2026\n")
    postgres_invoices = []
    for inv in invoices:
        # Replace date format YYYY/MM/DD with YYYY-MM-DD for PostgreSQL
        inv = inv.replace("    (", "    (").replace(", '", ", TIMESTAMP '").replace("'", "'", 1)
        inv = inv.replace("N'", "'")
        # Convert YYYY/MM/DD to YYYY-MM-DD
        inv = re.sub(r"TIMESTAMP '(\d{4})/(\d{2})/(\d{2})", r"TIMESTAMP '\1-\2-\3", inv)
        postgres_invoices.append(inv)
    
    for batch_num in range(0, len(postgres_invoices), batch_size):
        batch = postgres_invoices[batch_num:batch_num+batch_size]
        f.write("INSERT INTO invoice (customer_id, invoice_date, billing_address, billing_city, billing_state, billing_country, billing_postal_code, total) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # Invoice Lines - with batching for large datasets
    f.write("-- Additional invoice lines (2241+) - Links invoices to tracks\n")
    postgres_invoice_lines = [il.replace("    (", "    (") for il in invoice_lines]
    for batch_num in range(0, len(postgres_invoice_lines), batch_size):
        batch = postgres_invoice_lines[batch_num:batch_num+batch_size]
        f.write("INSERT INTO invoice_line (invoice_line_id, invoice_id, track_id, unit_price, quantity) OVERRIDING SYSTEM VALUE VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # SystemLog - optional table for database size inflation
    if systemlog and len(systemlog) > 0:
        f.write("-- SystemLog entries for database size inflation\n")
        f.write("-- Note: Only inserts if systemlog table exists in the database\n")
        f.write("-- PostgreSQL generates ~7.8KB padding per row using REPEAT() for fast insertion\n\n")
        
        # Check if table exists
        f.write("DO $$\n")
        f.write("BEGIN\n")
        f.write("  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'systemlog') THEN\n")
        
        # Process in batches
        total_batches = (len(systemlog) + batch_size - 1) // batch_size
        for batch_num in range(0, len(systemlog), batch_size):
            batch_end = min(batch_num + batch_size, len(systemlog))
            batch_index = batch_num // batch_size + 1
            
            # PostgreSQL doesn't have PRINT, but we can use RAISE NOTICE
            progress_interval = 5 if total_batches >= 20 else 1
            if batch_index % progress_interval == 1:
                f.write(f"    RAISE NOTICE 'Inserting system log entries... batch % of %', {batch_index}, {total_batches};\n")
            
            # Write batch
            postgres_systemlog = []
            for idx in range(batch_num, batch_end):
                log_entry = systemlog[idx]
                # Convert from (log_id, invoice_id, 'YYYY/MM/DD', N'message')
                # to PostgreSQL format with TIMESTAMP and single quotes
                log_clean = log_entry.strip()
                if log_clean.startswith("("):
                    log_clean = log_clean[1:]
                if log_clean.endswith(")"):
                    log_clean = log_clean[:-1]
                
                # Parse the fields
                parts = log_clean.split(", ", 3)
                log_id = parts[0]
                invoice_id = parts[1]
                log_date = parts[2].strip("'")
                log_msg = parts[3].replace("N'", "'")
                
                # Convert YYYY/MM/DD to YYYY-MM-DD
                log_date = log_date.replace("/", "-")
                
                postgres_systemlog.append(f"    ({log_id}, {invoice_id}, TIMESTAMP '{log_date}', {log_msg})")
            
            f.write("    INSERT INTO systemlog (log_id, invoice_id, log_date, log_message) OVERRIDING SYSTEM VALUE\n")
            f.write("    SELECT log_id, invoice_id, log_date, log_message || ' | ' || REPEAT('PADDING_', 70000)\n")
            f.write("    FROM (VALUES\n")
            f.write(",\n".join(postgres_systemlog))
            f.write("\n    ) AS log_data(log_id, invoice_id, log_date, log_message);\n\n")
        
        f.write("  END IF;\n")
        f.write("END $$;\n\n")
    
    # Commit transaction
    f.write("-- Commit transaction\n")
    f.write("COMMIT;\n")

def write_mysql_format(f, artists, albums, tracks, customers, invoices, invoice_lines, systemlog):
    """Write data in MySQL format (backticks, single quotes) with batching"""
    batch_size = 1000
    
    # Add transaction for better performance
    f.write("-- Begin transaction for bulk insert\n")
    f.write("START TRANSACTION;\n\n")
    
    # Artists
    f.write("-- Additional artists (276-355) - Real chart artists\n")
    mysql_artists = [a.replace("    (N'", "    ('") for a in artists]
    f.write("INSERT INTO `Artist` (`Name`) VALUES\n")
    f.write(",\n".join(mysql_artists))
    f.write(";\n\n")
    
    # Albums
    f.write("-- Additional albums (348-507) - Real chart albums\n")
    mysql_albums = [a.replace("    (N'", "    ('") for a in albums]
    f.write("INSERT INTO `Album` (`Title`, `ArtistId`) VALUES\n")
    f.write(",\n".join(mysql_albums))
    f.write(";\n\n")
    
    # Tracks\n    f.write("-- Additional tracks (3504-3942) - Real chart tracks\n")
    mysql_tracks = [t.replace("    (N'", "    ('") for t in tracks]
    f.write("INSERT INTO `Track` (`Name`, `AlbumId`, `MediaTypeId`, `GenreId`, `Composer`, `Milliseconds`, `Bytes`, `UnitPrice`) VALUES\n")
    f.write(",\n".join(mysql_tracks))
    f.write(";\n\n")
    
    # Customers - with batching for large datasets
    f.write("-- Additional customers (60-1000+)\n")
    mysql_customers = [c.replace("    (N'", "    ('") for c in customers]
    for batch_num in range(0, len(mysql_customers), batch_size):
        batch = mysql_customers[batch_num:batch_num+batch_size]
        f.write("INSERT INTO `Customer` (`FirstName`, `LastName`, `Company`, `Address`, `City`, `State`, `Country`, `PostalCode`, `Phone`, `Fax`, `Email`, `SupportRepId`) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # Invoices - with batching for large datasets
    f.write("-- Additional invoices (413-4000+) - 2022-2026\n")
    mysql_invoices = [i.replace("    (", "    (").replace("N'", "'") for i in invoices]
    for batch_num in range(0, len(mysql_invoices), batch_size):
        batch = mysql_invoices[batch_num:batch_num+batch_size]
        f.write("INSERT INTO `Invoice` (`CustomerId`, `InvoiceDate`, `BillingAddress`, `BillingCity`, `BillingState`, `BillingCountry`, `BillingPostalCode`, `Total`) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # Invoice Lines - with batching for large datasets
    f.write("-- Additional invoice lines (2241+) - Links invoices to tracks\n")
    mysql_invoice_lines = [il.replace("    (", "    (") for il in invoice_lines]
    for batch_num in range(0, len(mysql_invoice_lines), batch_size):
        batch = mysql_invoice_lines[batch_num:batch_num+batch_size]
        f.write("INSERT INTO `InvoiceLine` (`InvoiceLineId`, `InvoiceId`, `TrackId`, `UnitPrice`, `Quantity`) VALUES\n")
        f.write(",\n".join(batch))
        f.write(";\n\n")
    
    # SystemLog - optional table for database size inflation
    if systemlog and len(systemlog) > 0:
        f.write("-- SystemLog entries for database size inflation\n")
        f.write("-- Note: Only inserts if SystemLog table exists in the database\n")
        f.write("-- MySQL generates ~7.8KB padding per row using REPEAT() for fast insertion\n\n")
        
        # Process in batches - simpler approach without prepared statements
        total_batches = (len(systemlog) + batch_size - 1) // batch_size
        for batch_num in range(0, len(systemlog), batch_size):
            batch_end = min(batch_num + batch_size, len(systemlog))
            batch_index = batch_num // batch_size + 1
            
            f.write(f"-- Batch {batch_index} of {total_batches}\n")
            f.write("INSERT INTO `SystemLog` (`InvoiceId`, `LogDate`, `LogMessage`)\n")
            f.write("VALUES\n")
            
            # Build the VALUES list
            for idx in range(batch_num, batch_end):
                log_entry = systemlog[idx]
                # Convert from (log_id, invoice_id, 'YYYY/MM/DD', N'message')
                # MySQL doesn't use explicit log_id (AUTO_INCREMENT handles it)
                log_clean = log_entry.strip()
                if log_clean.startswith("("):
                    log_clean = log_clean[1:]
                if log_clean.endswith(")"):
                    log_clean = log_clean[:-1]
                
                # Parse the fields
                parts = log_clean.split(", ", 3)
                # Skip log_id (parts[0]) since it's AUTO_INCREMENT
                invoice_id = parts[1]
                log_date = parts[2].strip("'")  # Remove quotes
                log_msg = parts[3].replace("N'", "'")  # Just replace N' with ' - quotes are already properly escaped
                
                # Build the value with CONCAT for padding
                if idx < batch_end - 1:
                    f.write(f"    ({invoice_id}, '{log_date}', CONCAT({log_msg}, ' | ', REPEAT('PADDING_', 70000))),\n")
                else:
                    f.write(f"    ({invoice_id}, '{log_date}', CONCAT({log_msg}, ' | ', REPEAT('PADDING_', 70000)))\n")
            
            f.write(";\n\n")
    
    # Commit transaction
    f.write("-- Commit transaction\n")
    f.write("COMMIT;\n")

if __name__ == "__main__":
    main()
