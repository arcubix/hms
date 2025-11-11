-- Sample Data for Medicines and Lab Tests
-- This file contains realistic medicine brand names and common lab tests

-- ============================================
-- MEDICINES (Real Brand Names)
-- ============================================

INSERT INTO `medicines` (`medicine_code`, `name`, `generic_name`, `manufacturer`, `category`, `unit`, `strength`, `description`, `status`) VALUES
-- Antibiotics
('MED000001', 'Augmentin', 'Amoxicillin + Clavulanic Acid', 'GlaxoSmithKline', 'Antibiotic', 'Tablet', '625mg', 'Broad spectrum antibiotic for bacterial infections', 'Active'),
('MED000002', 'Azithromycin', 'Azithromycin', 'Pfizer', 'Antibiotic', 'Tablet', '500mg', 'Macrolide antibiotic for respiratory and skin infections', 'Active'),
('MED000003', 'Ciprofloxacin', 'Ciprofloxacin', 'Bayer', 'Antibiotic', 'Tablet', '500mg', 'Fluoroquinolone antibiotic for urinary and respiratory infections', 'Active'),
('MED000004', 'Amoxicillin', 'Amoxicillin', 'Various', 'Antibiotic', 'Capsule', '500mg', 'Penicillin antibiotic for bacterial infections', 'Active'),
('MED000005', 'Cefixime', 'Cefixime', 'Various', 'Antibiotic', 'Capsule', '400mg', 'Third generation cephalosporin antibiotic', 'Active'),

-- Painkillers & Anti-inflammatory
('MED000006', 'Panadol', 'Paracetamol', 'GlaxoSmithKline', 'Painkiller', 'Tablet', '500mg', 'Mild to moderate pain and fever relief', 'Active'),
('MED000007', 'Brufen', 'Ibuprofen', 'Abbott', 'Painkiller', 'Tablet', '400mg', 'Non-steroidal anti-inflammatory drug (NSAID)', 'Active'),
('MED000008', 'Diclofenac', 'Diclofenac Sodium', 'Various', 'Painkiller', 'Tablet', '50mg', 'NSAID for pain and inflammation', 'Active'),
('MED000009', 'Naproxen', 'Naproxen', 'Various', 'Painkiller', 'Tablet', '250mg', 'NSAID for arthritis and pain', 'Active'),
('MED000010', 'Tramadol', 'Tramadol', 'Various', 'Painkiller', 'Capsule', '50mg', 'Opioid pain reliever for moderate to severe pain', 'Active'),

-- Antacids & Digestive
('MED000011', 'Omeprazole', 'Omeprazole', 'Various', 'Antacid', 'Capsule', '20mg', 'Proton pump inhibitor for acid reflux and ulcers', 'Active'),
('MED000012', 'Pantoprazole', 'Pantoprazole', 'Various', 'Antacid', 'Tablet', '40mg', 'Proton pump inhibitor for GERD', 'Active'),
('MED000013', 'Ranitidine', 'Ranitidine', 'Various', 'Antacid', 'Tablet', '150mg', 'H2 blocker for stomach acid reduction', 'Active'),
('MED000014', 'Domperidone', 'Domperidone', 'Various', 'Digestive', 'Tablet', '10mg', 'Anti-nausea and gastric motility agent', 'Active'),
('MED000015', 'Metoclopramide', 'Metoclopramide', 'Various', 'Digestive', 'Tablet', '10mg', 'Anti-emetic and prokinetic agent', 'Active'),

-- Cardiovascular
('MED000016', 'Amlodipine', 'Amlodipine', 'Various', 'Cardiovascular', 'Tablet', '5mg', 'Calcium channel blocker for hypertension', 'Active'),
('MED000017', 'Atenolol', 'Atenolol', 'Various', 'Cardiovascular', 'Tablet', '50mg', 'Beta blocker for hypertension and angina', 'Active'),
('MED000018', 'Losartan', 'Losartan', 'Various', 'Cardiovascular', 'Tablet', '50mg', 'Angiotensin receptor blocker for hypertension', 'Active'),
('MED000019', 'Enalapril', 'Enalapril', 'Various', 'Cardiovascular', 'Tablet', '5mg', 'ACE inhibitor for hypertension', 'Active'),
('MED000020', 'Aspirin', 'Acetylsalicylic Acid', 'Various', 'Cardiovascular', 'Tablet', '75mg', 'Blood thinner and antiplatelet agent', 'Active'),

-- Respiratory
('MED000021', 'Salbutamol', 'Salbutamol', 'Various', 'Respiratory', 'Inhaler', '100mcg', 'Bronchodilator for asthma and COPD', 'Active'),
('MED000022', 'Montelukast', 'Montelukast', 'Various', 'Respiratory', 'Tablet', '10mg', 'Leukotriene receptor antagonist for asthma', 'Active'),
('MED000023', 'Levocetirizine', 'Levocetirizine', 'Various', 'Respiratory', 'Tablet', '5mg', 'Antihistamine for allergies', 'Active'),
('MED000024', 'Cetirizine', 'Cetirizine', 'Various', 'Respiratory', 'Tablet', '10mg', 'Antihistamine for allergic rhinitis', 'Active'),
('MED000025', 'Budesonide', 'Budesonide', 'Various', 'Respiratory', 'Inhaler', '200mcg', 'Corticosteroid inhaler for asthma', 'Active'),

-- Diabetes
('MED000026', 'Metformin', 'Metformin', 'Various', 'Diabetes', 'Tablet', '500mg', 'Biguanide for type 2 diabetes', 'Active'),
('MED000027', 'Glibenclamide', 'Glibenclamide', 'Various', 'Diabetes', 'Tablet', '5mg', 'Sulfonylurea for type 2 diabetes', 'Active'),
('MED000028', 'Gliclazide', 'Gliclazide', 'Various', 'Diabetes', 'Tablet', '80mg', 'Sulfonylurea for diabetes management', 'Active'),
('MED000029', 'Insulin Glargine', 'Insulin Glargine', 'Sanofi', 'Diabetes', 'Injection', '100IU/ml', 'Long-acting insulin', 'Active'),
('MED000030', 'Insulin Aspart', 'Insulin Aspart', 'Novo Nordisk', 'Diabetes', 'Injection', '100IU/ml', 'Rapid-acting insulin', 'Active'),

-- Vitamins & Supplements
('MED000031', 'Calcium Carbonate', 'Calcium Carbonate', 'Various', 'Vitamin', 'Tablet', '500mg', 'Calcium supplement for bone health', 'Active'),
('MED000032', 'Vitamin D3', 'Cholecalciferol', 'Various', 'Vitamin', 'Capsule', '1000IU', 'Vitamin D supplement', 'Active'),
('MED000033', 'Folic Acid', 'Folic Acid', 'Various', 'Vitamin', 'Tablet', '5mg', 'Folate supplement for anemia and pregnancy', 'Active'),
('MED000034', 'Iron Sulfate', 'Ferrous Sulfate', 'Various', 'Vitamin', 'Tablet', '200mg', 'Iron supplement for anemia', 'Active'),
('MED000035', 'Multivitamin', 'Multivitamin Complex', 'Various', 'Vitamin', 'Tablet', '1 tablet', 'Complete multivitamin supplement', 'Active'),

-- Antifungal
('MED000036', 'Fluconazole', 'Fluconazole', 'Various', 'Antifungal', 'Capsule', '150mg', 'Antifungal for yeast infections', 'Active'),
('MED000037', 'Clotrimazole', 'Clotrimazole', 'Various', 'Antifungal', 'Cream', '1%', 'Topical antifungal cream', 'Active'),
('MED000038', 'Terbinafine', 'Terbinafine', 'Various', 'Antifungal', 'Tablet', '250mg', 'Oral antifungal for nail and skin infections', 'Active'),

-- Antiviral
('MED000039', 'Acyclovir', 'Acyclovir', 'Various', 'Antiviral', 'Tablet', '400mg', 'Antiviral for herpes infections', 'Active'),
('MED000040', 'Oseltamivir', 'Oseltamivir', 'Roche', 'Antiviral', 'Capsule', '75mg', 'Antiviral for influenza', 'Active'),

-- Antidepressants
('MED000041', 'Sertraline', 'Sertraline', 'Various', 'Antidepressant', 'Tablet', '50mg', 'SSRI antidepressant', 'Active'),
('MED000042', 'Fluoxetine', 'Fluoxetine', 'Various', 'Antidepressant', 'Capsule', '20mg', 'SSRI antidepressant', 'Active'),
('MED000043', 'Amitriptyline', 'Amitriptyline', 'Various', 'Antidepressant', 'Tablet', '25mg', 'Tricyclic antidepressant', 'Active'),

-- Antihypertensive Combinations
('MED000044', 'Amlodipine + Atorvastatin', 'Amlodipine + Atorvastatin', 'Various', 'Cardiovascular', 'Tablet', '5mg/10mg', 'Combination for hypertension and cholesterol', 'Active'),
('MED000045', 'Hydrochlorothiazide + Losartan', 'HCTZ + Losartan', 'Various', 'Cardiovascular', 'Tablet', '12.5mg/50mg', 'Combination diuretic and ARB', 'Active'),

-- Topical
('MED000046', 'Betamethasone', 'Betamethasone', 'Various', 'Topical', 'Cream', '0.1%', 'Topical corticosteroid cream', 'Active'),
('MED000047', 'Hydrocortisone', 'Hydrocortisone', 'Various', 'Topical', 'Cream', '1%', 'Mild topical corticosteroid', 'Active'),
('MED000048', 'Mupirocin', 'Mupirocin', 'Various', 'Topical', 'Ointment', '2%', 'Topical antibiotic for skin infections', 'Active'),

-- Eye Drops
('MED000049', 'Chloramphenicol', 'Chloramphenicol', 'Various', 'Ophthalmic', 'Eye Drops', '0.5%', 'Antibiotic eye drops', 'Active'),
('MED000050', 'Artificial Tears', 'Carboxymethylcellulose', 'Various', 'Ophthalmic', 'Eye Drops', '0.5%', 'Lubricating eye drops', 'Active');

-- ============================================
-- LAB TESTS (Common Medical Tests)
-- ============================================

INSERT INTO `lab_tests` (`test_code`, `test_name`, `test_type`, `category`, `description`, `preparation_instructions`, `normal_range`, `duration`, `status`) VALUES
-- Blood Tests - Complete Blood Count
('LAB000001', 'Complete Blood Count (CBC)', 'Blood Test', 'Hematology', 'Complete blood count including RBC, WBC, Hemoglobin, Platelets', 'No special preparation required', 'RBC: 4.5-5.5 million/μL, WBC: 4000-11000/μL, Hb: 12-16 g/dL', 'Same day', 'Active'),
('LAB000002', 'Hemoglobin (Hb)', 'Blood Test', 'Hematology', 'Hemoglobin level measurement', 'No special preparation required', 'Male: 13.5-17.5 g/dL, Female: 12.0-15.5 g/dL', 'Same day', 'Active'),
('LAB000003', 'Hematocrit (Hct)', 'Blood Test', 'Hematology', 'Percentage of red blood cells in blood', 'No special preparation required', 'Male: 40-50%, Female: 36-46%', 'Same day', 'Active'),
('LAB000004', 'White Blood Cell Count (WBC)', 'Blood Test', 'Hematology', 'Total white blood cell count', 'No special preparation required', '4000-11000 cells/μL', 'Same day', 'Active'),
('LAB000005', 'Platelet Count', 'Blood Test', 'Hematology', 'Platelet count for clotting assessment', 'No special preparation required', '150000-450000/μL', 'Same day', 'Active'),

-- Blood Tests - Biochemistry
('LAB000006', 'Blood Glucose (Fasting)', 'Blood Test', 'Biochemistry', 'Fasting blood sugar level', 'Fasting required for 8-12 hours', '70-100 mg/dL', 'Same day', 'Active'),
('LAB000007', 'Blood Glucose (Random)', 'Blood Test', 'Biochemistry', 'Random blood sugar level', 'No fasting required', 'Below 140 mg/dL', 'Same day', 'Active'),
('LAB000008', 'HbA1c (Glycated Hemoglobin)', 'Blood Test', 'Biochemistry', 'Average blood sugar over 2-3 months', 'No special preparation required', 'Below 5.7% (normal), 5.7-6.4% (prediabetes)', '2-3 days', 'Active'),
('LAB000009', 'Lipid Profile', 'Blood Test', 'Biochemistry', 'Complete cholesterol and triglyceride panel', 'Fasting required for 12 hours', 'Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL', 'Same day', 'Active'),
('LAB000010', 'Total Cholesterol', 'Blood Test', 'Biochemistry', 'Total blood cholesterol level', 'Fasting required for 12 hours', '<200 mg/dL', 'Same day', 'Active'),
('LAB000011', 'Triglycerides', 'Blood Test', 'Biochemistry', 'Blood triglyceride level', 'Fasting required for 12 hours', '<150 mg/dL', 'Same day', 'Active'),
('LAB000012', 'Liver Function Test (LFT)', 'Blood Test', 'Biochemistry', 'Complete liver function panel (ALT, AST, Bilirubin, Albumin)', 'Fasting recommended', 'ALT: 7-56 U/L, AST: 10-40 U/L, Total Bilirubin: 0.1-1.2 mg/dL', 'Same day', 'Active'),
('LAB000013', 'ALT (Alanine Transaminase)', 'Blood Test', 'Biochemistry', 'Liver enzyme test', 'Fasting recommended', '7-56 U/L', 'Same day', 'Active'),
('LAB000014', 'AST (Aspartate Transaminase)', 'Blood Test', 'Biochemistry', 'Liver enzyme test', 'Fasting recommended', '10-40 U/L', 'Same day', 'Active'),
('LAB000015', 'Bilirubin (Total)', 'Blood Test', 'Biochemistry', 'Total bilirubin level', 'Fasting recommended', '0.1-1.2 mg/dL', 'Same day', 'Active'),
('LAB000016', 'Kidney Function Test (KFT)', 'Blood Test', 'Biochemistry', 'Complete kidney function panel (Creatinine, Urea, Uric Acid)', 'Fasting recommended', 'Creatinine: 0.6-1.2 mg/dL, Urea: 7-20 mg/dL', 'Same day', 'Active'),
('LAB000017', 'Creatinine', 'Blood Test', 'Biochemistry', 'Kidney function marker', 'Fasting recommended', 'Male: 0.7-1.3 mg/dL, Female: 0.6-1.1 mg/dL', 'Same day', 'Active'),
('LAB000018', 'Blood Urea Nitrogen (BUN)', 'Blood Test', 'Biochemistry', 'Kidney function marker', 'Fasting recommended', '7-20 mg/dL', 'Same day', 'Active'),
('LAB000019', 'Uric Acid', 'Blood Test', 'Biochemistry', 'Uric acid level for gout assessment', 'Fasting required for 8 hours', 'Male: 3.4-7.0 mg/dL, Female: 2.4-6.0 mg/dL', 'Same day', 'Active'),
('LAB000020', 'Serum Electrolytes', 'Blood Test', 'Biochemistry', 'Sodium, Potassium, Chloride levels', 'No special preparation required', 'Na: 136-145 mEq/L, K: 3.5-5.0 mEq/L, Cl: 98-107 mEq/L', 'Same day', 'Active'),

-- Thyroid Tests
('LAB000021', 'TSH (Thyroid Stimulating Hormone)', 'Blood Test', 'Endocrinology', 'Thyroid function screening test', 'No special preparation required', '0.4-4.0 mIU/L', 'Same day', 'Active'),
('LAB000022', 'Free T4', 'Blood Test', 'Endocrinology', 'Free thyroxine level', 'No special preparation required', '0.8-1.8 ng/dL', 'Same day', 'Active'),
('LAB000023', 'Free T3', 'Blood Test', 'Endocrinology', 'Free triiodothyronine level', 'No special preparation required', '2.3-4.2 pg/mL', 'Same day', 'Active'),
('LAB000024', 'Thyroid Profile (Complete)', 'Blood Test', 'Endocrinology', 'Complete thyroid function panel', 'No special preparation required', 'TSH: 0.4-4.0, FT4: 0.8-1.8, FT3: 2.3-4.2', 'Same day', 'Active'),

-- Cardiac Markers
('LAB000025', 'Troponin I', 'Blood Test', 'Cardiology', 'Cardiac marker for heart attack', 'No special preparation required', '<0.04 ng/mL', 'Same day', 'Active'),
('LAB000026', 'CK-MB', 'Blood Test', 'Cardiology', 'Creatine kinase-MB for heart damage', 'No special preparation required', '<5 ng/mL', 'Same day', 'Active'),
('LAB000027', 'BNP (Brain Natriuretic Peptide)', 'Blood Test', 'Cardiology', 'Heart failure marker', 'No special preparation required', '<100 pg/mL', 'Same day', 'Active'),

-- Infectious Disease
('LAB000028', 'Hepatitis B Surface Antigen (HBsAg)', 'Blood Test', 'Infectious Disease', 'Hepatitis B screening', 'No special preparation required', 'Negative', 'Same day', 'Active'),
('LAB000029', 'Hepatitis C Antibody (HCV)', 'Blood Test', 'Infectious Disease', 'Hepatitis C screening', 'No special preparation required', 'Negative', 'Same day', 'Active'),
('LAB000030', 'HIV 1 & 2 Antibody', 'Blood Test', 'Infectious Disease', 'HIV screening test', 'No special preparation required', 'Negative', 'Same day', 'Active'),
('LAB000031', 'VDRL/RPR', 'Blood Test', 'Infectious Disease', 'Syphilis screening', 'No special preparation required', 'Non-reactive', 'Same day', 'Active'),
('LAB000032', 'Malaria Parasite (MP)', 'Blood Test', 'Infectious Disease', 'Malaria detection', 'No special preparation required', 'Negative', 'Same day', 'Active'),
('LAB000033', 'Dengue NS1 Antigen', 'Blood Test', 'Infectious Disease', 'Dengue fever detection', 'No special preparation required', 'Negative', 'Same day', 'Active'),
('LAB000034', 'COVID-19 RT-PCR', 'Blood Test', 'Infectious Disease', 'COVID-19 detection by PCR', 'No special preparation required', 'Negative', '24-48 hours', 'Active'),

-- Urine Tests
('LAB000035', 'Urine Routine Examination', 'Urine Test', 'Urinalysis', 'Complete urine analysis including physical, chemical, and microscopic', 'Mid-stream clean catch sample', 'Color: Yellow, pH: 4.6-8.0, Specific Gravity: 1.005-1.030', 'Same day', 'Active'),
('LAB000036', 'Urine Culture & Sensitivity', 'Urine Test', 'Microbiology', 'Bacterial culture and antibiotic sensitivity', 'Mid-stream clean catch sample, sterile container', 'No growth (normal)', '2-3 days', 'Active'),
('LAB000037', '24-Hour Urine Protein', 'Urine Test', 'Urinalysis', 'Total protein in 24-hour urine collection', 'Collect all urine for 24 hours in provided container', '<150 mg/24 hours', 'Same day', 'Active'),
('LAB000038', 'Urine Pregnancy Test (UPT)', 'Urine Test', 'Urinalysis', 'Pregnancy detection test', 'First morning urine sample preferred', 'Negative/Positive', 'Same day', 'Active'),

-- Stool Tests
('LAB000039', 'Stool Routine Examination', 'Stool Test', 'Microbiology', 'Stool analysis for parasites and ova', 'Fresh sample in sterile container', 'No parasites/ova seen', 'Same day', 'Active'),
('LAB000040', 'Stool Culture & Sensitivity', 'Stool Test', 'Microbiology', 'Bacterial culture from stool', 'Fresh sample in sterile container', 'No pathogenic bacteria', '2-3 days', 'Active'),
('LAB000041', 'Occult Blood (Stool)', 'Stool Test', 'Gastroenterology', 'Hidden blood in stool', 'Avoid red meat and certain medications 3 days before', 'Negative', 'Same day', 'Active'),

-- Radiology
('LAB000042', 'Chest X-Ray (CXR)', 'X-Ray', 'Radiology', 'Chest radiograph for lung and heart assessment', 'Remove jewelry and metal objects', 'Normal lung fields, normal heart size', 'Same day', 'Active'),
('LAB000043', 'Abdominal X-Ray', 'X-Ray', 'Radiology', 'X-ray of abdomen for gastrointestinal issues', 'Fasting may be required', 'Normal bowel gas pattern', 'Same day', 'Active'),
('LAB000044', 'X-Ray Extremities', 'X-Ray', 'Radiology', 'X-ray of arms or legs for fractures', 'Remove jewelry', 'No fracture detected', 'Same day', 'Active'),
('LAB000045', 'CT Scan Head', 'CT Scan', 'Radiology', 'Computed tomography of head/brain', 'Fasting may be required, contrast may be used', 'Normal brain parenchyma', 'Same day', 'Active'),
('LAB000046', 'CT Scan Chest', 'CT Scan', 'Radiology', 'Computed tomography of chest', 'Fasting may be required, contrast may be used', 'Normal lung parenchyma', 'Same day', 'Active'),
('LAB000047', 'CT Scan Abdomen', 'CT Scan', 'Radiology', 'Computed tomography of abdomen', 'Fasting required, contrast used', 'Normal abdominal organs', 'Same day', 'Active'),
('LAB000048', 'Ultrasound Abdomen', 'Ultrasound', 'Radiology', 'Abdominal ultrasound for organ assessment', 'Fasting required for 6-8 hours', 'Normal size and echotexture of organs', 'Same day', 'Active'),
('LAB000049', 'Ultrasound Pelvis', 'Ultrasound', 'Radiology', 'Pelvic ultrasound for gynecological assessment', 'Full bladder required', 'Normal pelvic organs', 'Same day', 'Active'),
('LAB000050', 'ECG (Electrocardiogram)', 'ECG', 'Cardiology', 'Heart electrical activity recording', 'No special preparation required', 'Normal sinus rhythm', 'Same day', 'Active'),

-- Specialized Tests
('LAB000051', 'Vitamin B12', 'Blood Test', 'Hematology', 'Vitamin B12 level for anemia assessment', 'Fasting recommended', '200-900 pg/mL', 'Same day', 'Active'),
('LAB000052', 'Vitamin D (25-OH)', 'Blood Test', 'Biochemistry', 'Vitamin D level assessment', 'No special preparation required', '30-100 ng/mL (sufficient)', 'Same day', 'Active'),
('LAB000053', 'Ferritin', 'Blood Test', 'Hematology', 'Iron storage protein', 'Fasting recommended', 'Male: 20-250 ng/mL, Female: 10-120 ng/mL', 'Same day', 'Active'),
('LAB000054', 'PSA (Prostate Specific Antigen)', 'Blood Test', 'Oncology', 'Prostate cancer screening', 'No ejaculation 48 hours before', '<4.0 ng/mL', 'Same day', 'Active'),
('LAB000055', 'CA-125', 'Blood Test', 'Oncology', 'Ovarian cancer marker', 'No special preparation required', '<35 U/mL', 'Same day', 'Active'),
('LAB000056', 'CEA (Carcinoembryonic Antigen)', 'Blood Test', 'Oncology', 'Tumor marker for various cancers', 'Fasting recommended', '<3.0 ng/mL (non-smokers)', 'Same day', 'Active'),
('LAB000057', 'Rheumatoid Factor (RF)', 'Blood Test', 'Immunology', 'Rheumatoid arthritis marker', 'No special preparation required', '<15 IU/mL', 'Same day', 'Active'),
('LAB000058', 'ANA (Antinuclear Antibody)', 'Blood Test', 'Immunology', 'Autoimmune disease screening', 'No special preparation required', 'Negative (<1:40)', 'Same day', 'Active'),
('LAB000059', 'CRP (C-Reactive Protein)', 'Blood Test', 'Immunology', 'Inflammation marker', 'No special preparation required', '<3.0 mg/L', 'Same day', 'Active'),
('LAB000060', 'ESR (Erythrocyte Sedimentation Rate)', 'Blood Test', 'Hematology', 'Inflammation marker', 'No special preparation required', 'Male: <15 mm/hr, Female: <20 mm/hr', 'Same day', 'Active');

