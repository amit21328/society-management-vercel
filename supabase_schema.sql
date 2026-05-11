-- ============================================================
-- Society Management App — Database Schema + Seed Data
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS societies (
  id                 UUID PRIMARY KEY DEFAULT '11111111-1111-1111-1111-111111111111',
  name               TEXT NOT NULL,
  location           TEXT,
  address            TEXT,
  total_flats        INTEGER DEFAULT 20,
  maintenance_amount DECIMAL(10,2) DEFAULT 1500,
  upi_id             TEXT,
  secretary_name     TEXT,
  secretary_phone    TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  flat       TEXT NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT,
  type       TEXT DEFAULT 'Owner',
  status     TEXT DEFAULT 'Active',
  join_date  DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(society_id, flat)
);

CREATE TABLE IF NOT EXISTS payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  flat       TEXT NOT NULL,
  name       TEXT NOT NULL,
  month      TEXT NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  status     TEXT DEFAULT 'Unpaid',
  mode       TEXT DEFAULT '-',
  date       DATE,
  receipt_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(society_id, flat, month)
);

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id  UUID REFERENCES societies(id) ON DELETE CASCADE,
  month       TEXT NOT NULL,
  date        DATE NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  amount      DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  priority   TEXT DEFAULT 'Medium',
  date       DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Disable RLS for now (enable when auth is added) ─────────
ALTER TABLE societies    DISABLE ROW LEVEL SECURITY;
ALTER TABLE members      DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments     DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses     DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- ── Enable Realtime on payments (for cross-tab live sync) ───
ALTER TABLE payments REPLICA IDENTITY FULL;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Society
INSERT INTO societies (id, name, location, address, total_flats, maintenance_amount, upi_id, secretary_name, secretary_phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Sunrise Apartments', 'Kolkata',
  '12/A, Sunrise Complex, Salt Lake, Kolkata - 700091',
  20, 1500, 'sunriseapts@upi', 'Rajesh Kumar', '9876543201'
) ON CONFLICT (id) DO NOTHING;

-- Members
INSERT INTO members (society_id, flat, name, phone, type, join_date) VALUES
('11111111-1111-1111-1111-111111111111','101','Rajesh Kumar','9876543201','Owner','2020-01-15'),
('11111111-1111-1111-1111-111111111111','102','Priya Sharma','9876543202','Owner','2020-03-10'),
('11111111-1111-1111-1111-111111111111','103','Amit Das','9876543203','Owner','2019-11-20'),
('11111111-1111-1111-1111-111111111111','104','Sunita Roy','9876543204','Owner','2021-06-05'),
('11111111-1111-1111-1111-111111111111','105','Vikram Singh','9876543205','Tenant','2022-01-01'),
('11111111-1111-1111-1111-111111111111','106','Meena Ghosh','9876543206','Owner','2020-08-15'),
('11111111-1111-1111-1111-111111111111','107','Suresh Patel','9876543207','Owner','2019-05-10'),
('11111111-1111-1111-1111-111111111111','108','Anita Bose','9876543208','Tenant','2023-02-20'),
('11111111-1111-1111-1111-111111111111','109','Ravi Jain','9876543209','Owner','2021-09-01'),
('11111111-1111-1111-1111-111111111111','110','Kavita Mukherjee','9876543210','Owner','2020-12-15'),
('11111111-1111-1111-1111-111111111111','201','Deepak Sharma','9876543211','Owner','2022-03-01'),
('11111111-1111-1111-1111-111111111111','202','Neha Agarwal','9876543212','Tenant','2023-01-15'),
('11111111-1111-1111-1111-111111111111','203','Sanjay Verma','9876543213','Owner','2021-07-20'),
('11111111-1111-1111-1111-111111111111','204','Rekha Gupta','9876543214','Owner','2020-10-05'),
('11111111-1111-1111-1111-111111111111','205','Arun Pandey','9876543215','Owner','2022-06-01'),
('11111111-1111-1111-1111-111111111111','206','Pooja Mishra','9876543216','Tenant','2023-04-10'),
('11111111-1111-1111-1111-111111111111','207','Kamal Sinha','9876543217','Owner','2019-08-15'),
('11111111-1111-1111-1111-111111111111','208','Nisha Yadav','9876543218','Owner','2021-03-20'),
('11111111-1111-1111-1111-111111111111','209','Tarun Mehta','9876543219','Owner','2022-11-01'),
('11111111-1111-1111-1111-111111111111','210','Vandana Tiwari','9876543220','Owner','2020-05-30')
ON CONFLICT (society_id, flat) DO NOTHING;

-- Payments — May 2026
INSERT INTO payments (society_id,flat,name,month,amount,status,mode,date,receipt_no) VALUES
('11111111-1111-1111-1111-111111111111','101','Rajesh Kumar','May 2026',1500,'Paid','UPI','2026-05-01','RCP-MAY26-001'),
('11111111-1111-1111-1111-111111111111','102','Priya Sharma','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','103','Amit Das','May 2026',1500,'Paid','Cash','2026-05-02','RCP-MAY26-002'),
('11111111-1111-1111-1111-111111111111','104','Sunita Roy','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','105','Vikram Singh','May 2026',1500,'Paid','Bank Transfer','2026-05-03','RCP-MAY26-003'),
('11111111-1111-1111-1111-111111111111','106','Meena Ghosh','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','107','Suresh Patel','May 2026',1500,'Paid','UPI','2026-05-01','RCP-MAY26-004'),
('11111111-1111-1111-1111-111111111111','108','Anita Bose','May 2026',1500,'Paid','Cash','2026-05-04','RCP-MAY26-005'),
('11111111-1111-1111-1111-111111111111','109','Ravi Jain','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','110','Kavita Mukherjee','May 2026',1500,'Paid','UPI','2026-05-02','RCP-MAY26-006'),
('11111111-1111-1111-1111-111111111111','201','Deepak Sharma','May 2026',1500,'Paid','Bank Transfer','2026-05-01','RCP-MAY26-007'),
('11111111-1111-1111-1111-111111111111','202','Neha Agarwal','May 2026',1500,'Paid','UPI','2026-05-03','RCP-MAY26-008'),
('11111111-1111-1111-1111-111111111111','203','Sanjay Verma','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','204','Rekha Gupta','May 2026',1500,'Paid','Cash','2026-05-05','RCP-MAY26-009'),
('11111111-1111-1111-1111-111111111111','205','Arun Pandey','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','206','Pooja Mishra','May 2026',1500,'Paid','UPI','2026-05-02','RCP-MAY26-010'),
('11111111-1111-1111-1111-111111111111','207','Kamal Sinha','May 2026',1500,'Paid','Bank Transfer','2026-05-01','RCP-MAY26-011'),
('11111111-1111-1111-1111-111111111111','208','Nisha Yadav','May 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','209','Tarun Mehta','May 2026',1500,'Paid','UPI','2026-05-04','RCP-MAY26-012'),
('11111111-1111-1111-1111-111111111111','210','Vandana Tiwari','May 2026',1500,'Paid','Cash','2026-05-05','RCP-MAY26-013')
ON CONFLICT (society_id, flat, month) DO NOTHING;

-- Payments — Apr 2026
INSERT INTO payments (society_id,flat,name,month,amount,status,mode,date,receipt_no) VALUES
('11111111-1111-1111-1111-111111111111','101','Rajesh Kumar','Apr 2026',1500,'Paid','UPI','2026-04-02','RCP-APR26-001'),
('11111111-1111-1111-1111-111111111111','102','Priya Sharma','Apr 2026',1500,'Paid','Cash','2026-04-05','RCP-APR26-002'),
('11111111-1111-1111-1111-111111111111','103','Amit Das','Apr 2026',1500,'Paid','UPI','2026-04-01','RCP-APR26-003'),
('11111111-1111-1111-1111-111111111111','104','Sunita Roy','Apr 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','105','Vikram Singh','Apr 2026',1500,'Paid','Bank Transfer','2026-04-03','RCP-APR26-004'),
('11111111-1111-1111-1111-111111111111','106','Meena Ghosh','Apr 2026',1500,'Paid','UPI','2026-04-04','RCP-APR26-005'),
('11111111-1111-1111-1111-111111111111','107','Suresh Patel','Apr 2026',1500,'Paid','UPI','2026-04-01','RCP-APR26-006'),
('11111111-1111-1111-1111-111111111111','108','Anita Bose','Apr 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','109','Ravi Jain','Apr 2026',1500,'Paid','Cash','2026-04-06','RCP-APR26-007'),
('11111111-1111-1111-1111-111111111111','110','Kavita Mukherjee','Apr 2026',1500,'Paid','UPI','2026-04-02','RCP-APR26-008'),
('11111111-1111-1111-1111-111111111111','201','Deepak Sharma','Apr 2026',1500,'Paid','Bank Transfer','2026-04-01','RCP-APR26-009'),
('11111111-1111-1111-1111-111111111111','202','Neha Agarwal','Apr 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','203','Sanjay Verma','Apr 2026',1500,'Paid','UPI','2026-04-03','RCP-APR26-010'),
('11111111-1111-1111-1111-111111111111','204','Rekha Gupta','Apr 2026',1500,'Paid','Cash','2026-04-07','RCP-APR26-011'),
('11111111-1111-1111-1111-111111111111','205','Arun Pandey','Apr 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','206','Pooja Mishra','Apr 2026',1500,'Paid','UPI','2026-04-02','RCP-APR26-012'),
('11111111-1111-1111-1111-111111111111','207','Kamal Sinha','Apr 2026',1500,'Paid','Bank Transfer','2026-04-01','RCP-APR26-013'),
('11111111-1111-1111-1111-111111111111','208','Nisha Yadav','Apr 2026',1500,'Paid','UPI','2026-04-04','RCP-APR26-014'),
('11111111-1111-1111-1111-111111111111','209','Tarun Mehta','Apr 2026',1500,'Paid','Cash','2026-04-05','RCP-APR26-015'),
('11111111-1111-1111-1111-111111111111','210','Vandana Tiwari','Apr 2026',1500,'Paid','UPI','2026-04-03','RCP-APR26-016')
ON CONFLICT (society_id, flat, month) DO NOTHING;

-- Payments — Mar 2026
INSERT INTO payments (society_id,flat,name,month,amount,status,mode,date,receipt_no) VALUES
('11111111-1111-1111-1111-111111111111','101','Rajesh Kumar','Mar 2026',1500,'Paid','UPI','2026-03-01','RCP-MAR26-001'),
('11111111-1111-1111-1111-111111111111','102','Priya Sharma','Mar 2026',1500,'Paid','Cash','2026-03-03','RCP-MAR26-002'),
('11111111-1111-1111-1111-111111111111','103','Amit Das','Mar 2026',1500,'Paid','UPI','2026-03-01','RCP-MAR26-003'),
('11111111-1111-1111-1111-111111111111','104','Sunita Roy','Mar 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','105','Vikram Singh','Mar 2026',1500,'Paid','Bank Transfer','2026-03-02','RCP-MAR26-004'),
('11111111-1111-1111-1111-111111111111','106','Meena Ghosh','Mar 2026',1500,'Paid','UPI','2026-03-04','RCP-MAR26-005'),
('11111111-1111-1111-1111-111111111111','107','Suresh Patel','Mar 2026',1500,'Paid','UPI','2026-03-01','RCP-MAR26-006'),
('11111111-1111-1111-1111-111111111111','108','Anita Bose','Mar 2026',1500,'Paid','Cash','2026-03-05','RCP-MAR26-007'),
('11111111-1111-1111-1111-111111111111','109','Ravi Jain','Mar 2026',1500,'Paid','UPI','2026-03-03','RCP-MAR26-008'),
('11111111-1111-1111-1111-111111111111','110','Kavita Mukherjee','Mar 2026',1500,'Paid','UPI','2026-03-02','RCP-MAR26-009'),
('11111111-1111-1111-1111-111111111111','201','Deepak Sharma','Mar 2026',1500,'Paid','Bank Transfer','2026-03-01','RCP-MAR26-010'),
('11111111-1111-1111-1111-111111111111','202','Neha Agarwal','Mar 2026',1500,'Paid','UPI','2026-03-04','RCP-MAR26-011'),
('11111111-1111-1111-1111-111111111111','203','Sanjay Verma','Mar 2026',1500,'Paid','Cash','2026-03-06','RCP-MAR26-012'),
('11111111-1111-1111-1111-111111111111','204','Rekha Gupta','Mar 2026',1500,'Paid','UPI','2026-03-03','RCP-MAR26-013'),
('11111111-1111-1111-1111-111111111111','205','Arun Pandey','Mar 2026',1500,'Unpaid','-',NULL,NULL),
('11111111-1111-1111-1111-111111111111','206','Pooja Mishra','Mar 2026',1500,'Paid','UPI','2026-03-02','RCP-MAR26-014'),
('11111111-1111-1111-1111-111111111111','207','Kamal Sinha','Mar 2026',1500,'Paid','Bank Transfer','2026-03-01','RCP-MAR26-015'),
('11111111-1111-1111-1111-111111111111','208','Nisha Yadav','Mar 2026',1500,'Paid','UPI','2026-03-05','RCP-MAR26-016'),
('11111111-1111-1111-1111-111111111111','209','Tarun Mehta','Mar 2026',1500,'Paid','Cash','2026-03-04','RCP-MAR26-017'),
('11111111-1111-1111-1111-111111111111','210','Vandana Tiwari','Mar 2026',1500,'Paid','UPI','2026-03-03','RCP-MAR26-018')
ON CONFLICT (society_id, flat, month) DO NOTHING;

-- Payments — Feb 2026 (all paid)
INSERT INTO payments (society_id,flat,name,month,amount,status,mode,date,receipt_no) VALUES
('11111111-1111-1111-1111-111111111111','101','Rajesh Kumar','Feb 2026',1500,'Paid','UPI','2026-02-01','RCP-FEB26-001'),
('11111111-1111-1111-1111-111111111111','102','Priya Sharma','Feb 2026',1500,'Paid','Cash','2026-02-03','RCP-FEB26-002'),
('11111111-1111-1111-1111-111111111111','103','Amit Das','Feb 2026',1500,'Paid','UPI','2026-02-02','RCP-FEB26-003'),
('11111111-1111-1111-1111-111111111111','104','Sunita Roy','Feb 2026',1500,'Paid','Cash','2026-02-08','RCP-FEB26-004'),
('11111111-1111-1111-1111-111111111111','105','Vikram Singh','Feb 2026',1500,'Paid','Bank Transfer','2026-02-01','RCP-FEB26-005'),
('11111111-1111-1111-1111-111111111111','106','Meena Ghosh','Feb 2026',1500,'Paid','UPI','2026-02-04','RCP-FEB26-006'),
('11111111-1111-1111-1111-111111111111','107','Suresh Patel','Feb 2026',1500,'Paid','UPI','2026-02-01','RCP-FEB26-007'),
('11111111-1111-1111-1111-111111111111','108','Anita Bose','Feb 2026',1500,'Paid','Cash','2026-02-05','RCP-FEB26-008'),
('11111111-1111-1111-1111-111111111111','109','Ravi Jain','Feb 2026',1500,'Paid','UPI','2026-02-03','RCP-FEB26-009'),
('11111111-1111-1111-1111-111111111111','110','Kavita Mukherjee','Feb 2026',1500,'Paid','Bank Transfer','2026-02-02','RCP-FEB26-010'),
('11111111-1111-1111-1111-111111111111','201','Deepak Sharma','Feb 2026',1500,'Paid','UPI','2026-02-01','RCP-FEB26-011'),
('11111111-1111-1111-1111-111111111111','202','Neha Agarwal','Feb 2026',1500,'Paid','UPI','2026-02-04','RCP-FEB26-012'),
('11111111-1111-1111-1111-111111111111','203','Sanjay Verma','Feb 2026',1500,'Paid','Cash','2026-02-06','RCP-FEB26-013'),
('11111111-1111-1111-1111-111111111111','204','Rekha Gupta','Feb 2026',1500,'Paid','UPI','2026-02-03','RCP-FEB26-014'),
('11111111-1111-1111-1111-111111111111','205','Arun Pandey','Feb 2026',1500,'Paid','Bank Transfer','2026-02-02','RCP-FEB26-015'),
('11111111-1111-1111-1111-111111111111','206','Pooja Mishra','Feb 2026',1500,'Paid','UPI','2026-02-01','RCP-FEB26-016'),
('11111111-1111-1111-1111-111111111111','207','Kamal Sinha','Feb 2026',1500,'Paid','Bank Transfer','2026-02-01','RCP-FEB26-017'),
('11111111-1111-1111-1111-111111111111','208','Nisha Yadav','Feb 2026',1500,'Paid','UPI','2026-02-05','RCP-FEB26-018'),
('11111111-1111-1111-1111-111111111111','209','Tarun Mehta','Feb 2026',1500,'Paid','Cash','2026-02-04','RCP-FEB26-019'),
('11111111-1111-1111-1111-111111111111','210','Vandana Tiwari','Feb 2026',1500,'Paid','UPI','2026-02-03','RCP-FEB26-020')
ON CONFLICT (society_id, flat, month) DO NOTHING;

-- Expenses
INSERT INTO expenses (society_id,month,date,category,description,amount) VALUES
('11111111-1111-1111-1111-111111111111','May 2026','2026-05-02','Electricity','Common area electricity bill',2000),
('11111111-1111-1111-1111-111111111111','May 2026','2026-05-01','Security','Monthly security guard salary',2500),
('11111111-1111-1111-1111-111111111111','May 2026','2026-05-05','Cleaning','Housekeeping & cleaning services',1200),
('11111111-1111-1111-1111-111111111111','May 2026','2026-05-08','Repairs','Lift maintenance and repair',500),
('11111111-1111-1111-1111-111111111111','Apr 2026','2026-04-02','Electricity','Common area electricity bill',1850),
('11111111-1111-1111-1111-111111111111','Apr 2026','2026-04-01','Security','Monthly security guard salary',2500),
('11111111-1111-1111-1111-111111111111','Apr 2026','2026-04-05','Cleaning','Housekeeping & cleaning services',1200),
('11111111-1111-1111-1111-111111111111','Apr 2026','2026-04-10','Plumbing','Water pipe leakage repair',750),
('11111111-1111-1111-1111-111111111111','Mar 2026','2026-03-02','Electricity','Common area electricity bill',2100),
('11111111-1111-1111-1111-111111111111','Mar 2026','2026-03-01','Security','Monthly security guard salary',2500),
('11111111-1111-1111-1111-111111111111','Mar 2026','2026-03-05','Cleaning','Housekeeping & cleaning services',1200),
('11111111-1111-1111-1111-111111111111','Mar 2026','2026-03-12','Painting','Staircase & lobby painting',3500),
('11111111-1111-1111-1111-111111111111','Feb 2026','2026-02-02','Electricity','Common area electricity bill',1950),
('11111111-1111-1111-1111-111111111111','Feb 2026','2026-02-01','Security','Monthly security guard salary',2500),
('11111111-1111-1111-1111-111111111111','Feb 2026','2026-02-05','Cleaning','Housekeeping & cleaning services',1200),
('11111111-1111-1111-1111-111111111111','Feb 2026','2026-02-08','Repairs','CCTV camera replacement',1800);

-- Announcements
INSERT INTO announcements (society_id,title,message,priority,date) VALUES
('11111111-1111-1111-1111-111111111111','Water Supply Interruption','Water supply will be off on 12th May from 10am-2pm due to pipeline maintenance. Please store water in advance.','High','2026-05-10'),
('11111111-1111-1111-1111-111111111111','Society Meeting — 15th May','Monthly society meeting scheduled on 15th May at 7pm in the community hall. All residents are requested to attend.','Medium','2026-05-10'),
('11111111-1111-1111-1111-111111111111','Maintenance Fee Reminder','May 2026 maintenance fee of Rs.1500 is due. Please pay via UPI: sunriseapts@upi. Last date: 15th May.','High','2026-05-01'),
('11111111-1111-1111-1111-111111111111','New Security Protocol','All visitors must register at the security gate with valid ID from 1st May onwards.','Medium','2026-04-28'),
('11111111-1111-1111-1111-111111111111','Parking Rules Update','Please ensure your vehicle is parked in your designated spot only. Unauthorized parking will result in towing.','Low','2026-04-20');
