import { createClient } from '@/lib/supabase/client';
import { Database, PopulatedExtraction } from '@/types/database.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient() as any;

/**
 * Obtiene todas las extracciones de la base de datos de manera global con relaciones de Café y Método.
 * @returns Lista completa de extracciones con relaciones pobladas.
 */
export async function getExtractions(): Promise<PopulatedExtraction[]> {
  try {
    const { data, error } = await supabase
      .from('extractions')
      .select('*, coffees(*), methods(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Advertencia en getExtractions: error al consultar Supabase', error.message);
      return [];
    }

    return (data as PopulatedExtraction[]) || [];
  } catch (error) {
    console.warn('Advertencia en getExtractions: error inesperado', error);
    return [];
  }
}

/**
 * Registra una nueva extracción en Supabase y devuelve el objeto con las relaciones pobladas.
 * @param extraction Estructura de la extracción a guardar.
 * @returns La extracción guardada con cafés y métodos poblados, o null si falló.
 */
export async function createExtraction(
  extraction: Database['public']['Tables']['extractions']['Insert'],
): Promise<PopulatedExtraction | null> {
  try {
    const { data, error } = await supabase
      .from('extractions')
      .insert(extraction)
      .select('*, coffees(*), methods(*)')
      .single();

    if (error) {
      console.warn('Advertencia en createExtraction: error al insertar en Supabase', error.message);
      return null;
    }

    return data as PopulatedExtraction;
  } catch (error) {
    console.warn('Advertencia en createExtraction: error inesperado', error);
    return null;
  }
}

/**
 * Elimina una extracción por su ID.
 * @param extractionId ID de la extracción a eliminar.
 * @returns true si se eliminó con éxito, false en caso contrario.
 */
export async function deleteExtraction(extractionId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('extractions').delete().eq('id', extractionId);

    if (error) {
      console.warn('Advertencia en deleteExtraction: error al eliminar en Supabase', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Advertencia en deleteExtraction: error inesperado', error);
    return false;
  }
}
