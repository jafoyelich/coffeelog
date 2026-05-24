import { createClient } from '@/lib/supabase/client';
import { Database, Method } from '@/types/database.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient() as any;

/**
 * Obtiene todos los métodos de extracción de la base de datos de manera global.
 * @returns Lista completa de métodos de extracción.
 */
export async function getMethods(): Promise<Method[]> {
  try {
    const { data, error } = await supabase
      .from('methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Advertencia en getMethods: error al consultar Supabase', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Advertencia en getMethods: error inesperado', error);
    return [];
  }
}

/**
 * Crea un nuevo método de extracción en la base de datos.
 * @param method Estructura del método a crear.
 * @returns El método creado o null si falló.
 */
export async function createMethod(
  method: Database['public']['Tables']['methods']['Insert'],
): Promise<Method | null> {
  try {
    const { data, error } = await supabase.from('methods').insert(method).select().single();

    if (error) {
      console.warn('Advertencia en createMethod: error al insertar en Supabase', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Advertencia en createMethod: error inesperado', error);
    return null;
  }
}

/**
 * Elimina un método de extracción por su ID.
 * @param methodId ID del método a eliminar.
 * @returns true si se eliminó con éxito, false en caso contrario.
 */
export async function deleteMethod(methodId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('methods').delete().eq('id', methodId);

    if (error) {
      console.warn('Advertencia en deleteMethod: error al eliminar en Supabase', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Advertencia en deleteMethod: error inesperado', error);
    return false;
  }
}
