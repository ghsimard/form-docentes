import { Pool } from 'pg';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

interface ExcelRow {
  'ID': string;
  'Entiendo la información y acepto el trato de mis datos personales:': string;
  'Nombre(s) y Apellido(s) completo(s)': string;
  'Número de cédula': string;
  'Género': string;
  'Lugar de nacimiento': string;
  'Fecha de nacimiento': string | Date;
  'Lengua materna': string;
  'Número de celular personal': string;
  'Correo electrónico personal': string;
  'Correo electrónico institucional (el que usted usa en su rol como directivo docente)': string;
  'Prefiere recibir comunicaciones en el correo': string;
  '¿Tiene alguna enfermedad de base por la que pueda requerir atención especial durante los encuentros presenciales?': string;
  'Si requiere atención médica urgente durante algún encuentro presencial ¿A quién podemos contactar?': string;
  '¿Cuál es su número de contacto?': string;
  '¿Tiene alguna discapacidad?': string;
  'Tipo de formación': string;
  'Título de pregrado': string;
  'Título de especialización': string;
  'Título de maestría': string;
  'Título de doctorado': string;
  'Nombre de la Institución Educativa en la actualmente desempeña su labor': string;
  'Cargo actual': string;
  'Tipo de vinculación actual': string;
  'Fecha de vinculación al servicio educativo estatal': string | Date;
  'Fecha de nombramiento estatal en el cargo actual': string | Date;
  'Fecha de nombramiento del cargo actual en la IE': string | Date;
  'Estatuto al que pertenece': string;
  'Grado en el escalafón': string;
  'Código DANE de la IE (12 dígitos)': string;
  'Entidad Territorial': string;
  'Comuna, corregimiento o localidad': string;
  'Zona de la sede principal de la IE': string;
  'Zona de la sede principal de la IE2': string;
  'Dirección de la sede principal': string;
  'Teléfono de contacto de la IE': string;
  'Sitio web': string;
  'Correo electrónico institucional': string;
  'Número total de sedes de la IE (incluida la sede principal)': string;
  'Número de sedes en zona rural': string;
  'Número de sedes en zona urbana': string;
  'Jornadas de la IE (Selección múltiple)': string;
  'Grupos étnicos en la IE (Selección múltiple)': string;
  'Proyectos transversales de la IE': string;
  'Estudiantes o familias de la IE en condición de desplazamiento': string;
  'Niveles educativos que ofrece la IE (Selección múltiple)': string;
  'Tipo de bachillerato que ofrece la IE': string;
  'Modelo o enfoque pedagógico': string;
  'Número de docentes': string;
  'Número de coordinadoras/es': string;
  'Número de administrativos': string;
  'Número de orientadoras/es': string;
  'Número de estudiantes en Preescolar': string;
  'Número de estudiantes en Básica primaria': string;
  'Número de estudiantes en Básica secundaria': string;
  'Número de estudiantes en Media': string;
  'Número de estudiantes en ciclo complementario': string;
}

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'ghsimard',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'form_docentes',
});

// Create Rectores table dynamically based on Excel headers
const createRectoresTable = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS rectores;');
    console.log('Dropped existing rectores table');

    // Create table with explicit column types
    const createTableQuery = `
      CREATE TABLE rectores (
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
    console.log('rectores table created successfully');
  } catch (err) {
    console.error('Error creating rectores table:', err);
    throw err;
  }
};

// Function to convert value based on column type
const convertValue = (value: any, type: string): any => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  switch (type) {
    case 'BOOLEAN':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const lowercaseValue = value.toLowerCase().trim();
        return lowercaseValue === 'sí' || lowercaseValue === 'si' || lowercaseValue === 'yes' || lowercaseValue === '1' || lowercaseValue === 'true';
      }
      return false;

    case 'INTEGER':
    case 'BIGINT':
      const num = parseInt(value.toString().replace(/\D/g, ''));
      return isNaN(num) ? null : num;

    case 'DATE':
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      if (typeof value === 'string') {
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
              day = parseInt(part1);
              month = parseInt(part2);
              year = parseInt(part3);
            } else {
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

    case 'TEXT[]':
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      return null;

    default:
      return value;
  }
};

// Import data from Excel
const importExcelData = async (filePath: string) => {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

    if (data.length === 0) {
      throw new Error('No data found in Excel file');
    }

    // Create table
    await createRectoresTable();

    // Insert data
    for (const row of data) {
      const query = `
        INSERT INTO rectores (
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
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
          $51, $52, $53, $54, $55, $56, $57
        )
      `;

      const values = [
        convertValue(row['ID'], 'TEXT'),
        convertValue(row['Entiendo la información y acepto el trato de mis datos personales:'], 'BOOLEAN'),
        convertValue(row['Nombre(s) y Apellido(s) completo(s)'], 'TEXT'),
        convertValue(row['Número de cédula'], 'INTEGER'),
        convertValue(row['Género'], 'TEXT'),
        convertValue(row['Lugar de nacimiento'], 'TEXT'),
        convertValue(row['Fecha de nacimiento'], 'DATE'),
        convertValue(row['Lengua materna'], 'TEXT'),
        convertValue(row['Número de celular personal'], 'TEXT'),
        convertValue(row['Correo electrónico personal'], 'TEXT'),
        convertValue(row['Correo electrónico institucional (el que usted usa en su rol como directivo docente)'], 'TEXT'),
        convertValue(row['Prefiere recibir comunicaciones en el correo'], 'TEXT'),
        convertValue(row['¿Tiene alguna enfermedad de base por la que pueda requerir atención especial durante los encuentros presenciales?'], 'BOOLEAN'),
        convertValue(row['Si requiere atención médica urgente durante algún encuentro presencial ¿A quién podemos contactar?'], 'TEXT'),
        convertValue(row['¿Cuál es su número de contacto?'], 'TEXT'),
        convertValue(row['¿Tiene alguna discapacidad?'], 'BOOLEAN'),
        convertValue(row['Tipo de formación'], 'TEXT'),
        convertValue(row['Título de pregrado'], 'TEXT'),
        convertValue(row['Título de especialización'], 'TEXT'),
        convertValue(row['Título de maestría'], 'TEXT'),
        convertValue(row['Título de doctorado'], 'TEXT'),
        convertValue(row['Nombre de la Institución Educativa en la actualmente desempeña su labor'], 'TEXT'),
        convertValue(row['Cargo actual'], 'TEXT'),
        convertValue(row['Tipo de vinculación actual'], 'TEXT'),
        convertValue(row['Fecha de vinculación al servicio educativo estatal'], 'DATE'),
        convertValue(row['Fecha de nombramiento estatal en el cargo actual'], 'DATE'),
        convertValue(row['Fecha de nombramiento del cargo actual en la IE'], 'DATE'),
        convertValue(row['Estatuto al que pertenece'], 'TEXT'),
        convertValue(row['Grado en el escalafón'], 'TEXT'),
        convertValue(row['Código DANE de la IE (12 dígitos)'], 'BIGINT'),
        convertValue(row['Entidad Territorial'], 'TEXT'),
        convertValue(row['Comuna, corregimiento o localidad'], 'TEXT'),
        convertValue(row['Zona de la sede principal de la IE'], 'TEXT'),
        convertValue(row['Zona de la sede principal de la IE2'], 'TEXT'),
        convertValue(row['Dirección de la sede principal'], 'TEXT'),
        convertValue(row['Teléfono de contacto de la IE'], 'TEXT'),
        convertValue(row['Sitio web'], 'TEXT'),
        convertValue(row['Correo electrónico institucional'], 'TEXT'),
        convertValue(row['Número total de sedes de la IE (incluida la sede principal)'], 'INTEGER'),
        convertValue(row['Número de sedes en zona rural'], 'INTEGER'),
        convertValue(row['Número de sedes en zona urbana'], 'INTEGER'),
        convertValue(row['Jornadas de la IE (Selección múltiple)'], 'TEXT[]'),
        convertValue(row['Grupos étnicos en la IE (Selección múltiple)'], 'TEXT[]'),
        convertValue(row['Proyectos transversales de la IE'], 'TEXT'),
        convertValue(row['Estudiantes o familias de la IE en condición de desplazamiento'], 'BOOLEAN'),
        convertValue(row['Niveles educativos que ofrece la IE (Selección múltiple)'], 'TEXT[]'),
        convertValue(row['Tipo de bachillerato que ofrece la IE'], 'TEXT'),
        convertValue(row['Modelo o enfoque pedagógico'], 'TEXT'),
        convertValue(row['Número de docentes'], 'INTEGER'),
        convertValue(row['Número de coordinadoras/es'], 'INTEGER'),
        convertValue(row['Número de administrativos'], 'INTEGER'),
        convertValue(row['Número de orientadoras/es'], 'INTEGER'),
        convertValue(row['Número de estudiantes en Preescolar'], 'INTEGER'),
        convertValue(row['Número de estudiantes en Básica primaria'], 'INTEGER'),
        convertValue(row['Número de estudiantes en Básica secundaria'], 'INTEGER'),
        convertValue(row['Número de estudiantes en Media'], 'INTEGER'),
        convertValue(row['Número de estudiantes en ciclo complementario'], 'INTEGER')
      ];

      // Debug logging
      console.log('Number of columns in query:', query.match(/\$\d+/g)?.length);
      console.log('Number of values:', values.length);
      console.log('First row keys:', Object.keys(row));

      await pool.query(query, values);
    }

    console.log(`Successfully imported ${data.length} records`);
  } catch (err) {
    console.error('Error importing data:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

// Main function
const main = async () => {
  try {
    const filePath = process.argv[2];
    if (!filePath) {
      throw new Error('Please provide the Excel file path as an argument');
    }

    await importExcelData(filePath);
    console.log('Data import completed successfully');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

// Run the script
main(); 