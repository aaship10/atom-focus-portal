-- Essential Data for Role Table
INSERT INTO "Role" (id, name) VALUES
(1, 'Employee'),
(2, 'Manager'),
(3, 'Admin')
ON CONFLICT (id) DO NOTHING;

-- Dummy Data for ThrustArea Table
INSERT INTO "ThrustArea" (name, description) VALUES
('Sales & Revenue', 'Driving business growth through new acquisitions, renewals, and expansion.'),
('Product Innovation', 'Developing new features, improving UX, and maintaining technical excellence.'),
('Customer Excellence', 'Enhancing customer satisfaction, retention, and support quality.'),
('Operational Efficiency', 'Optimizing internal processes, reducing waste, and improving productivity.'),
('Human Capital', 'Focusing on employee training, engagement, and culture development.')
ON CONFLICT (name) DO NOTHING;
