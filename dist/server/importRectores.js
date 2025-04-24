import { Pool } from 'pg';
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER || 'ghsimard',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'form_docentes',
});
// Function to convert Excel column name to PostgreSQL compatible name
const toPostgresColumnName = (name) => {
    // Special case for 'id' column from Excel
    if (name.toLowerCase() === 'id') {
        return 'excel_id';
    }
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9_]/g, '_') // Replace non-alphanumeric chars with underscore
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .replace(/_+/g, '_'); // Replace multiple underscores with single
};
// Function to get column type based on value and name
const getColumnType = (name, value) => {
    // Special case for consent column
    if (name.toLowerCase().includes('entiendo') && name.toLowerCase().includes('acepto')) {
        return 'BOOLEAN';
    }
    // Handle date fields
    if (name.toLowerCase().includes('fecha')) {
        return 'DATE';
    }
    // Handle cedula as integer and codigo_dane as bigint
    if (name === 'numero_de_cedula') {
        return 'INTEGER';
    }
    if (name === 'codigo_dane_de_la_ie_12_digitos') {
        return 'BIGINT';
    }
    // Handle numeric fields
    if (name.toLowerCase().includes('numero') &&
        !name.toLowerCase().includes('celular') &&
        !name.toLowerCase().includes('telefono')) {
        return 'INTEGER';
    }
    if (Array.isArray(value))
        return 'TEXT[]';
    if (typeof value === 'object' && value !== null)
        return 'JSONB';
    return 'TEXT';
};
// Create Rectores table dynamically based on Excel headers
const createRectoresTable = async (headers) => {
    // Drop existing table if it exists
    try {
        await pool.query('DROP TABLE IF EXISTS Rectores;');
        console.log('Dropped existing Rectores table');
        // Create table with explicit column types
        const createTableQuery = `
      CREATE TABLE Rectores (
        id SERIAL PRIMARY KEY,
        excel_id TEXT,
        entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal BOOLEAN,
        nombre_s_y_apellido_s_completo_s TEXT,
        numero_de_cedula INTEGER,
        genero TEXT,
        lugar_de_nacimiento TEXT,
        fecha_de_nacimiento DATE,
        lengua_materna TEXT,
        numero_de_celular_personal TEXT,
        correo_electronico_personal TEXT,
        correo_electronico_institucional_el_que_usted_usa_en_su_rol_com TEXT,
        prefiere_recibir_comunicaciones_en_el_correo TEXT,
        tiene_alguna_enfermedad_de_base_por_la_que_pueda_requerir_atenc BOOLEAN,
        si_requiere_atencion_medica_urgente_durante_algun_encuentro_pre TEXT,
        cual_es_su_numero_de_contacto TEXT,
        tiene_alguna_discapacidad BOOLEAN,
        tipo_de_formacion TEXT,
        titulo_de_pregrado TEXT,
        titulo_de_especializacion TEXT,
        titulo_de_maestria TEXT,
        titulo_de_doctorado TEXT,
        nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ TEXT,
        cargo_actual TEXT,
        tipo_de_vinculacion_actual TEXT,
        fecha_de_vinculacion_al_servicio_educativo_estatal DATE,
        fecha_de_nombramiento_estatal_en_el_cargo_actual DATE,
        fecha_de_nombramiento_del_cargo_actual_en_la_ie DATE,
        estatuto_al_que_pertenece TEXT,
        grado_en_el_escalafon TEXT,
        codigo_dane_de_la_ie_12_digitos BIGINT,
        entidad_territorial TEXT,
        comuna_corregimiento_o_localidad TEXT,
        zona_de_la_sede_principal_de_la_ie TEXT,
        zona_de_la_sede_principal_de_la_ie2 TEXT,
        direccion_de_la_sede_principal TEXT,
        telefono_de_contacto_de_la_ie TEXT,
        sitio_web TEXT,
        correo_electronico_institucional TEXT,
        numero_total_de_sedes_de_la_ie_incluida_la_sede_principal INTEGER,
        numero_de_sedes_en_zona_rural INTEGER,
        numero_de_sedes_en_zona_urbana INTEGER,
        jornadas_de_la_ie_seleccion_multiple TEXT[],
        grupos_etnicos_en_la_ie_seleccion_multiple TEXT[],
        proyectos_transversales_de_la_ie TEXT,
        estudiantes_o_familias_de_la_ie_en_condicion_de_desplazamiento BOOLEAN,
        niveles_educativos_que_ofrece_la_ie_seleccion_multiple TEXT[],
        tipo_de_bachillerato_que_ofrece_la_ie TEXT,
        modelo_o_enfoque_pedagogico TEXT,
        numero_de_docentes INTEGER,
        numero_de_coordinadoras_es INTEGER,
        numero_de_administrativos INTEGER,
        numero_de_orientadoras_es INTEGER,
        numero_de_estudiantes_en_preescolar INTEGER,
        numero_de_estudiantes_en_basica_primaria INTEGER,
        numero_de_estudiantes_en_basica_secundaria INTEGER,
        numero_de_estudiantes_en_media INTEGER,
        numero_de_estudiantes_en_ciclo_complementario INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await pool.query(createTableQuery);
        console.log('Rectores table created successfully');
        // Log the table structure for verification
        const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rectores' 
      ORDER BY ordinal_position;
    `);
        console.log('\nTable structure:');
        tableInfo.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}`);
        });
    }
    catch (err) {
        console.error('Error creating Rectores table:', err);
        throw err;
    }
};
// Function to convert value based on column name
const convertValue = (header, value) => {
    // Special case for consent and other boolean columns
    if (header.toLowerCase().includes('entiendo') && header.toLowerCase().includes('acepto') ||
        header === 'tiene_alguna_enfermedad_de_base_por_la_que_pueda_requerir_atenc' ||
        header === 'tiene_alguna_discapacidad' ||
        header === 'estudiantes_o_familias_de_la_ie_en_condicion_de_desplazamiento') {
        if (!value)
            return false;
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'number')
            return Boolean(value === 1);
        if (typeof value === 'string') {
            const lowercaseValue = value.toLowerCase().trim();
            return Boolean(lowercaseValue === 'sí' ||
                lowercaseValue === 'si' ||
                lowercaseValue === 'yes' ||
                lowercaseValue === '1' ||
                lowercaseValue === 'true');
        }
        return false;
    }
    // Handle date fields
    if (header.toLowerCase().includes('fecha')) {
        if (!value)
            return null;
        // If it's already a Date object
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        // Try to parse string date formats
        if (typeof value === 'string') {
            // Handle different date formats
            const formats = [
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/ // DD-MM-YYYY
            ];
            for (const format of formats) {
                const match = value.match(format);
                if (match) {
                    const [_, part1, part2, part3] = match;
                    let year, month, day;
                    if (format === formats[0] || format === formats[2]) {
                        // DD/MM/YYYY or DD-MM-YYYY
                        day = parseInt(part1);
                        month = parseInt(part2);
                        year = parseInt(part3);
                    }
                    else {
                        // YYYY-MM-DD
                        year = parseInt(part1);
                        month = parseInt(part2);
                        day = parseInt(part3);
                    }
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
            }
        }
        return null;
    }
    // Handle cedula and codigo_dane
    if (header === 'numero_de_cedula' || header === 'codigo_dane_de_la_ie_12_digitos') {
        if (!value || value === 'NA' || value === '')
            return null;
        // Remove any non-numeric characters
        const numStr = value.toString().replace(/\D/g, '');
        const num = parseInt(numStr);
        return isNaN(num) ? null : num;
    }
    // Handle numeric fields
    if (header.toLowerCase().includes('numero') &&
        !header.toLowerCase().includes('celular') &&
        !header.toLowerCase().includes('telefono')) {
        if (!value || value === 'NA' || value === '')
            return null;
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    }
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return value || null;
};
// Function to convert array string to PostgreSQL array
const convertToPostgresArray = (value) => {
    if (!value)
        return null;
    // Split by comma and clean up each value
    return value.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
};
// Import data from Excel
const importExcelData = async (filePath) => {
    try {
        // Read Excel file with raw values to properly handle dates
        const workbook = readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });
        if (data.length === 0) {
            throw new Error('Excel file is empty');
        }
        // Get headers
        const headers = Object.keys(data[0]);
        // Create temporary table with all columns as TEXT
        await pool.query('DROP TABLE IF EXISTS temp_rectores;');
        const tempColumnDefinitions = headers.map(header => {
            const columnName = toPostgresColumnName(header);
            return `${columnName} TEXT`;
        }).join(',\n    ');
        const createTempTableQuery = `
      CREATE TEMPORARY TABLE temp_rectores (
        id SERIAL PRIMARY KEY,
        ${tempColumnDefinitions},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await pool.query(createTempTableQuery);
        console.log('Temporary table created successfully');
        // Insert data into temporary table
        const columnNames = headers.map(toPostgresColumnName).join(', ');
        const valuePlaceholders = headers.map((_, i) => `$${i + 1}`).join(', ');
        // Insert each row into the temporary table
        for (const row of data) {
            const query = `
        INSERT INTO temp_rectores (${columnNames})
        VALUES (${valuePlaceholders});
      `;
            const values = headers.map(header => {
                const value = convertValue(header, row[header]);
                return value?.toString() || null;
            });
            await pool.query(query, values);
        }
        console.log(`Successfully imported ${data.length} records into temporary table`);
        // Create final table with correct data types
        await createRectoresTable(headers);
        // Insert data from temporary table with proper type casting
        const insertQuery = `
      INSERT INTO Rectores (
        excel_id,
        entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal,
        nombre_s_y_apellido_s_completo_s,
        numero_de_cedula,
        genero,
        lugar_de_nacimiento,
        fecha_de_nacimiento,
        lengua_materna,
        numero_de_celular_personal,
        correo_electronico_personal,
        correo_electronico_institucional_el_que_usted_usa_en_su_rol_com,
        prefiere_recibir_comunicaciones_en_el_correo,
        tiene_alguna_enfermedad_de_base_por_la_que_pueda_requerir_atenc,
        si_requiere_atencion_medica_urgente_durante_algun_encuentro_pre,
        cual_es_su_numero_de_contacto,
        tiene_alguna_discapacidad,
        tipo_de_formacion,
        titulo_de_pregrado,
        titulo_de_especializacion,
        titulo_de_maestria,
        titulo_de_doctorado,
        nombre_de_la_institucion_educativa_en_la_actualmente_desempena_,
        cargo_actual,
        tipo_de_vinculacion_actual,
        fecha_de_vinculacion_al_servicio_educativo_estatal,
        fecha_de_nombramiento_estatal_en_el_cargo_actual,
        fecha_de_nombramiento_del_cargo_actual_en_la_ie,
        estatuto_al_que_pertenece,
        grado_en_el_escalafon,
        codigo_dane_de_la_ie_12_digitos,
        entidad_territorial,
        comuna_corregimiento_o_localidad,
        zona_de_la_sede_principal_de_la_ie,
        zona_de_la_sede_principal_de_la_ie2,
        direccion_de_la_sede_principal,
        telefono_de_contacto_de_la_ie,
        sitio_web,
        correo_electronico_institucional,
        numero_total_de_sedes_de_la_ie_incluida_la_sede_principal,
        numero_de_sedes_en_zona_rural,
        numero_de_sedes_en_zona_urbana,
        jornadas_de_la_ie_seleccion_multiple,
        grupos_etnicos_en_la_ie_seleccion_multiple,
        proyectos_transversales_de_la_ie,
        estudiantes_o_familias_de_la_ie_en_condicion_de_desplazamiento,
        niveles_educativos_que_ofrece_la_ie_seleccion_multiple,
        tipo_de_bachillerato_que_ofrece_la_ie,
        modelo_o_enfoque_pedagogico,
        numero_de_docentes,
        numero_de_coordinadoras_es,
        numero_de_administrativos,
        numero_de_orientadoras_es,
        numero_de_estudiantes_en_preescolar,
        numero_de_estudiantes_en_basica_primaria,
        numero_de_estudiantes_en_basica_secundaria,
        numero_de_estudiantes_en_media,
        numero_de_estudiantes_en_ciclo_complementario
      )
      SELECT 
        excel_id,
        CASE 
          WHEN LOWER(entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal) IN ('sí', 'si', 'yes', '1', 'true') THEN true
          ELSE false
        END,
        nombre_s_y_apellido_s_completo_s,
        numero_de_cedula::INTEGER,
        genero,
        lugar_de_nacimiento,
        fecha_de_nacimiento::DATE,
        lengua_materna,
        numero_de_celular_personal,
        correo_electronico_personal,
        correo_electronico_institucional_el_que_usted_usa_en_su_rol_com,
        prefiere_recibir_comunicaciones_en_el_correo,
        CASE 
          WHEN LOWER(tiene_alguna_enfermedad_de_base_por_la_que_pueda_requerir_atenc) IN ('sí', 'si', 'yes', '1', 'true') THEN true
          ELSE false
        END,
        si_requiere_atencion_medica_urgente_durante_algun_encuentro_pre,
        cual_es_su_numero_de_contacto,
        CASE 
          WHEN LOWER(tiene_alguna_discapacidad) IN ('sí', 'si', 'yes', '1', 'true') THEN true
          ELSE false
        END,
        tipo_de_formacion,
        titulo_de_pregrado,
        titulo_de_especializacion,
        titulo_de_maestria,
        titulo_de_doctorado,
        nombre_de_la_institucion_educativa_en_la_actualmente_desempena_,
        cargo_actual,
        tipo_de_vinculacion_actual,
        fecha_de_vinculacion_al_servicio_educativo_estatal::DATE,
        fecha_de_nombramiento_estatal_en_el_cargo_actual::DATE,
        fecha_de_nombramiento_del_cargo_actual_en_la_ie::DATE,
        estatuto_al_que_pertenece,
        grado_en_el_escalafon,
        codigo_dane_de_la_ie_12_digitos::BIGINT,
        entidad_territorial,
        comuna_corregimiento_o_localidad,
        zona_de_la_sede_principal_de_la_ie,
        zona_de_la_sede_principal_de_la_ie2,
        direccion_de_la_sede_principal,
        telefono_de_contacto_de_la_ie,
        sitio_web,
        correo_electronico_institucional,
        NULLIF(numero_total_de_sedes_de_la_ie_incluida_la_sede_principal, '')::INTEGER,
        NULLIF(numero_de_sedes_en_zona_rural, '')::INTEGER,
        NULLIF(numero_de_sedes_en_zona_urbana, '')::INTEGER,
        string_to_array(NULLIF(jornadas_de_la_ie_seleccion_multiple, ''), ','),
        string_to_array(NULLIF(grupos_etnicos_en_la_ie_seleccion_multiple, ''), ','),
        proyectos_transversales_de_la_ie,
        CASE 
          WHEN LOWER(estudiantes_o_familias_de_la_ie_en_condicion_de_desplazamiento) IN ('sí', 'si', 'yes', '1', 'true') THEN true
          ELSE false
        END,
        string_to_array(NULLIF(niveles_educativos_que_ofrece_la_ie_seleccion_multiple, ''), ','),
        tipo_de_bachillerato_que_ofrece_la_ie,
        modelo_o_enfoque_pedagogico,
        NULLIF(numero_de_docentes, '')::INTEGER,
        NULLIF(numero_de_coordinadoras_es, '')::INTEGER,
        NULLIF(numero_de_administrativos, '')::INTEGER,
        NULLIF(numero_de_orientadoras_es, '')::INTEGER,
        NULLIF(numero_de_estudiantes_en_preescolar, '')::INTEGER,
        NULLIF(numero_de_estudiantes_en_basica_primaria, '')::INTEGER,
        NULLIF(numero_de_estudiantes_en_basica_secundaria, '')::INTEGER,
        NULLIF(numero_de_estudiantes_en_media, '')::INTEGER,
        NULLIF(numero_de_estudiantes_en_ciclo_complementario, '')::INTEGER
      FROM temp_rectores;
    `;
        await pool.query(insertQuery);
        console.log('Successfully converted and inserted data into final table');
        // Drop temporary table
        await pool.query('DROP TABLE temp_rectores;');
        console.log('Temporary table dropped');
    }
    catch (err) {
        console.error('Error importing data:', err);
        throw err;
    }
};
// Main function
const main = async () => {
    try {
        // Get Excel file path from command line arguments
        const filePath = process.argv[2];
        if (!filePath) {
            throw new Error('Please provide the Excel file path as an argument');
        }
        // Import data
        await importExcelData(filePath);
        console.log('Data import completed successfully');
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        // Close the pool
        await pool.end();
    }
};
// Run the script
main();
