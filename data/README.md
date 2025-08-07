# Data Directory Structure

This directory contains all the data files used by AbNovoBench. The actual data files are not included in the repository for privacy and size reasons, but example files are provided.

## 📁 Directory Structure

```
data/
├── assembly/              # Assembly evaluation data
│   ├── assembly_scores.csv
│   ├── assembly_static.csv
│   └── Assembly-result_ALPS.csv
├── impact/                # Robustness testing data
│   └── NoiseFactorANDMissingcleavagesVSRecall.csv
├── csv/                   # General CSV data files
│   └── efficiency.csv
├── mgf/                   # MGF spectrum files
│   └── *.mgf
└── depth/                 # Coverage depth data
    └── *.csv
```

## 📊 Data File Formats

### Assembly Data (`assembly/`)
- **assembly_scores.csv**: Assembly evaluation scores
  - Columns: Algorithm, Antibody, Tool, Score, Region
- **assembly_static.csv**: Static assembly statistics
- **Assembly-result_ALPS.csv**: ALPS assembly results

### Impact Data (`impact/`)
- **NoiseFactorANDMissingcleavagesVSRecall.csv**: Robustness testing
  - Columns: Tool, AA_Recall, Peptide_Recall, Noise_Factor, Missing_Cleavages

### Efficiency Data (`csv/`)
- **efficiency.csv**: Processing speed data
  - Columns: Algorithm, Speed_Spectrums_Per_Second

### MGF Files (`mgf/`)
- Spectrum files in MGF format
- Used for peptide sequencing analysis

### Depth Data (`depth/`)
- Coverage depth analysis files
- Position-specific coverage data

## 🔧 Setup Instructions

1. **Create data directories:**
   ```bash
   mkdir -p data/assembly data/impact data/csv data/mgf data/depth
   ```

2. **Add your data files:**
   - Copy your actual CSV files to the appropriate directories
   - Ensure file names match the expected format
   - Verify CSV column headers match the expected format

3. **Example files:**
   - Example files are provided with `.example` extension
   - Use these as templates for your actual data

## 📋 Required Files

### Minimum Required Files
- `data/assembly/assembly_scores.csv`
- `data/impact/NoiseFactorANDMissingcleavagesVSRecall.csv`
- `data/csv/efficiency.csv`

### Optional Files
- `data/assembly/assembly_static.csv`
- `data/assembly/Assembly-result_ALPS.csv`
- `data/mgf/*.mgf` (spectrum files)
- `data/depth/*.csv` (coverage data)

## 🔒 Privacy and Security

- Actual data files are not included in the repository
- Example files contain dummy data for reference
- Sensitive data should be stored securely
- Use environment variables for database credentials

## 📈 Data Validation

Before deployment, verify your data files:

1. **CSV Format**: Ensure proper comma separation
2. **Column Headers**: Match expected column names
3. **Data Types**: Verify numeric data is properly formatted
4. **File Encoding**: Use UTF-8 encoding

## 🐛 Troubleshooting

### Common Issues

1. **File Not Found Errors:**
   - Check file paths in backend routes
   - Verify file names match exactly
   - Ensure files are in correct directories

2. **CSV Parsing Errors:**
   - Check CSV format and encoding
   - Verify column headers
   - Test with example files first

3. **Data Display Issues:**
   - Check data format in frontend components
   - Verify API responses
   - Test with sample data

## 📞 Support

For data-related issues:
1. Check file formats and paths
2. Verify CSV structure
3. Test with example files
4. Review backend logs
5. Create an issue on GitHub

---

**Note**: Replace example files with your actual data before deployment. 