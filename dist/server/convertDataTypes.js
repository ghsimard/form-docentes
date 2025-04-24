import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER || 'ghsimard',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'form_docentes',
});
const showTableStructure = async () => {
    const tableInfo = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'rectores' 
    ORDER BY ordinal_position;
  `);
    console.log('\nCurrent table structure:');
    tableInfo.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type}`);
    });
};
const convertDataTypes = async () => {
    const client = await pool.connect();
    try {
        // Start transaction
        await client.query('BEGIN');
        // Show current structure
        await showTableStructure();
        console.log('Converting numeric columns...');
        // Clean up the data by standardizing NA-like values directly in the table
        await client.query(`
      UPDATE rectores
      SET 
        numero_total_de_sedes_de_la_ie_incluida_la_sede_principal = 
          CASE WHEN numero_total_de_sedes_de_la_ie_incluida_la_sede_principal IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_total_de_sedes_de_la_ie_incluida_la_sede_principal IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_total_de_sedes_de_la_ie_incluida_la_sede_principal::text, '[^0-9]', '', 'g') END,
        numero_de_sedes_en_zona_rural = 
          CASE WHEN numero_de_sedes_en_zona_rural IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_sedes_en_zona_rural IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_sedes_en_zona_rural::text, '[^0-9]', '', 'g') END,
        numero_de_sedes_en_zona_urbana = 
          CASE WHEN numero_de_sedes_en_zona_urbana IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_sedes_en_zona_urbana IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_sedes_en_zona_urbana::text, '[^0-9]', '', 'g') END,
        numero_de_docentes = 
          CASE WHEN numero_de_docentes IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_docentes IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_docentes::text, '[^0-9]', '', 'g') END,
        numero_de_coordinadoras_es = 
          CASE WHEN numero_de_coordinadoras_es IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_coordinadoras_es IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_coordinadoras_es::text, '[^0-9]', '', 'g') END,
        numero_de_administrativos = 
          CASE WHEN numero_de_administrativos IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_administrativos IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_administrativos::text, '[^0-9]', '', 'g') END,
        numero_de_orientadoras_es = 
          CASE WHEN numero_de_orientadoras_es IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_orientadoras_es IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_orientadoras_es::text, '[^0-9]', '', 'g') END,
        numero_de_estudiantes_en_preescolar = 
          CASE WHEN numero_de_estudiantes_en_preescolar IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_estudiantes_en_preescolar IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_estudiantes_en_preescolar::text, '[^0-9]', '', 'g') END,
        numero_de_estudiantes_en_basica_primaria = 
          CASE WHEN numero_de_estudiantes_en_basica_primaria IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_estudiantes_en_basica_primaria IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_estudiantes_en_basica_primaria::text, '[^0-9]', '', 'g') END,
        numero_de_estudiantes_en_basica_secundaria = 
          CASE WHEN numero_de_estudiantes_en_basica_secundaria IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_estudiantes_en_basica_secundaria IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_estudiantes_en_basica_secundaria::text, '[^0-9]', '', 'g') END,
        numero_de_estudiantes_en_media = 
          CASE WHEN numero_de_estudiantes_en_media IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_estudiantes_en_media IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_estudiantes_en_media::text, '[^0-9]', '', 'g') END,
        numero_de_estudiantes_en_ciclo_complementario = 
          CASE WHEN numero_de_estudiantes_en_ciclo_complementario IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_estudiantes_en_ciclo_complementario IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_estudiantes_en_ciclo_complementario::text, '[^0-9]', '', 'g') END,
        numero_de_cedula = 
          CASE WHEN numero_de_cedula IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR numero_de_cedula IS NULL THEN NULL 
          ELSE REGEXP_REPLACE(numero_de_cedula::text, '[^0-9]', '', 'g') END;
    `);
        // Now alter the column types with the cleaned data
        console.log('Converting numeric columns...');
        await client.query(`
      ALTER TABLE rectores
      ALTER COLUMN numero_total_de_sedes_de_la_ie_incluida_la_sede_principal TYPE INTEGER USING NULLIF(numero_total_de_sedes_de_la_ie_incluida_la_sede_principal, '')::INTEGER,
      ALTER COLUMN numero_de_sedes_en_zona_rural TYPE INTEGER USING NULLIF(numero_de_sedes_en_zona_rural, '')::INTEGER,
      ALTER COLUMN numero_de_sedes_en_zona_urbana TYPE INTEGER USING NULLIF(numero_de_sedes_en_zona_urbana, '')::INTEGER,
      ALTER COLUMN numero_de_docentes TYPE INTEGER USING NULLIF(numero_de_docentes, '')::INTEGER,
      ALTER COLUMN numero_de_coordinadoras_es TYPE INTEGER USING NULLIF(numero_de_coordinadoras_es, '')::INTEGER,
      ALTER COLUMN numero_de_administrativos TYPE INTEGER USING NULLIF(numero_de_administrativos, '')::INTEGER,
      ALTER COLUMN numero_de_orientadoras_es TYPE INTEGER USING NULLIF(numero_de_orientadoras_es, '')::INTEGER,
      ALTER COLUMN numero_de_estudiantes_en_preescolar TYPE INTEGER USING NULLIF(numero_de_estudiantes_en_preescolar, '')::INTEGER,
      ALTER COLUMN numero_de_estudiantes_en_basica_primaria TYPE INTEGER USING NULLIF(numero_de_estudiantes_en_basica_primaria, '')::INTEGER,
      ALTER COLUMN numero_de_estudiantes_en_basica_secundaria TYPE INTEGER USING NULLIF(numero_de_estudiantes_en_basica_secundaria, '')::INTEGER,
      ALTER COLUMN numero_de_estudiantes_en_media TYPE INTEGER USING NULLIF(numero_de_estudiantes_en_media, '')::INTEGER,
      ALTER COLUMN numero_de_estudiantes_en_ciclo_complementario TYPE INTEGER USING NULLIF(numero_de_estudiantes_en_ciclo_complementario, '')::INTEGER,
      ALTER COLUMN numero_de_cedula TYPE NUMERIC USING NULLIF(numero_de_cedula, '')::NUMERIC;
    `);
        // Convert date columns
        console.log('Converting date columns...');
        await client.query(`
      ALTER TABLE rectores
      ALTER COLUMN fecha_de_nacimiento TYPE DATE USING (
        CASE 
          WHEN fecha_de_nacimiento IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR fecha_de_nacimiento IS NULL THEN NULL
          WHEN fecha_de_nacimiento ~ '^[0-9]+$' THEN 
            DATE '1899-12-30' + (fecha_de_nacimiento::integer * INTERVAL '1 day')
          ELSE 
            CASE
              WHEN fecha_de_nacimiento ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(fecha_de_nacimiento, 'MM/DD/YYYY')
              WHEN fecha_de_nacimiento ~ '^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$' THEN fecha_de_nacimiento::date
              ELSE NULL
            END
        END
      ),
      ALTER COLUMN fecha_de_vinculacion_al_servicio_educativo_estatal TYPE DATE USING (
        CASE 
          WHEN fecha_de_vinculacion_al_servicio_educativo_estatal IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR fecha_de_vinculacion_al_servicio_educativo_estatal IS NULL THEN NULL
          WHEN fecha_de_vinculacion_al_servicio_educativo_estatal ~ '^[0-9]+$' THEN 
            DATE '1899-12-30' + (fecha_de_vinculacion_al_servicio_educativo_estatal::integer * INTERVAL '1 day')
          ELSE 
            CASE
              WHEN fecha_de_vinculacion_al_servicio_educativo_estatal ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(fecha_de_vinculacion_al_servicio_educativo_estatal, 'MM/DD/YYYY')
              WHEN fecha_de_vinculacion_al_servicio_educativo_estatal ~ '^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$' THEN fecha_de_vinculacion_al_servicio_educativo_estatal::date
              ELSE NULL
            END
        END
      ),
      ALTER COLUMN fecha_de_nombramiento_estatal_en_el_cargo_actual TYPE DATE USING (
        CASE 
          WHEN fecha_de_nombramiento_estatal_en_el_cargo_actual IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR fecha_de_nombramiento_estatal_en_el_cargo_actual IS NULL THEN NULL
          WHEN fecha_de_nombramiento_estatal_en_el_cargo_actual ~ '^[0-9]+$' THEN 
            DATE '1899-12-30' + (fecha_de_nombramiento_estatal_en_el_cargo_actual::integer * INTERVAL '1 day')
          ELSE 
            CASE
              WHEN fecha_de_nombramiento_estatal_en_el_cargo_actual ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(fecha_de_nombramiento_estatal_en_el_cargo_actual, 'MM/DD/YYYY')
              WHEN fecha_de_nombramiento_estatal_en_el_cargo_actual ~ '^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$' THEN fecha_de_nombramiento_estatal_en_el_cargo_actual::date
              ELSE NULL
            END
        END
      ),
      ALTER COLUMN fecha_de_nombramiento_del_cargo_actual_en_la_ie TYPE DATE USING (
        CASE 
          WHEN fecha_de_nombramiento_del_cargo_actual_en_la_ie IN ('NA', 'N/A', 'NO APLICA', 'N.A', '-', '') 
               OR fecha_de_nombramiento_del_cargo_actual_en_la_ie IS NULL THEN NULL
          WHEN fecha_de_nombramiento_del_cargo_actual_en_la_ie ~ '^[0-9]+$' THEN 
            DATE '1899-12-30' + (fecha_de_nombramiento_del_cargo_actual_en_la_ie::integer * INTERVAL '1 day')
          ELSE 
            CASE
              WHEN fecha_de_nombramiento_del_cargo_actual_en_la_ie ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(fecha_de_nombramiento_del_cargo_actual_en_la_ie, 'MM/DD/YYYY')
              WHEN fecha_de_nombramiento_del_cargo_actual_en_la_ie ~ '^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$' THEN fecha_de_nombramiento_del_cargo_actual_en_la_ie::date
              ELSE NULL
            END
        END
      );
    `);
        // Convert boolean columns
        console.log('Converting boolean columns...');
        await client.query(`
      ALTER TABLE rectores
      ALTER COLUMN entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal TYPE BOOLEAN 
      USING CASE 
        WHEN entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal IN ('true', 'TRUE', 't', 'T', 'yes', 'YES', 'y', 'Y', '1') THEN true
        WHEN entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal IN ('false', 'FALSE', 'f', 'F', 'no', 'NO', 'n', 'N', '0') THEN false
        ELSE NULL
      END;
    `);
        // Convert array columns
        console.log('Converting array columns...');
        await client.query(`
      ALTER TABLE rectores
      ALTER COLUMN jornadas_de_la_ie_seleccion_multiple TYPE TEXT[] 
      USING CASE 
        WHEN jornadas_de_la_ie_seleccion_multiple IS NULL OR jornadas_de_la_ie_seleccion_multiple = '' THEN NULL
        ELSE string_to_array(TRIM(BOTH '[]' FROM jornadas_de_la_ie_seleccion_multiple), ',')
      END,
      ALTER COLUMN grupos_etnicos_en_la_ie_seleccion_multiple TYPE TEXT[] 
      USING CASE 
        WHEN grupos_etnicos_en_la_ie_seleccion_multiple IS NULL OR grupos_etnicos_en_la_ie_seleccion_multiple = '' THEN NULL
        ELSE string_to_array(TRIM(BOTH '[]' FROM grupos_etnicos_en_la_ie_seleccion_multiple), ',')
      END,
      ALTER COLUMN niveles_educativos_que_ofrece_la_ie_seleccion_multiple TYPE TEXT[] 
      USING CASE 
        WHEN niveles_educativos_que_ofrece_la_ie_seleccion_multiple IS NULL OR niveles_educativos_que_ofrece_la_ie_seleccion_multiple = '' THEN NULL
        ELSE string_to_array(TRIM(BOTH '[]' FROM niveles_educativos_que_ofrece_la_ie_seleccion_multiple), ',')
      END;
    `);
        await client.query('COMMIT');
        console.log('Data type conversion completed successfully');
        // Show final structure
        await showTableStructure();
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during data type conversion:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
convertDataTypes().catch(console.error);
