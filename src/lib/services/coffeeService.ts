import { createClient } from '@/lib/supabase/client';
import { Database, Coffee } from '@/types/database.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient() as any;

/**
 * Obtiene todos los cafés de la base de datos de manera global.
 * @returns Lista completa de cafés.
 */
export async function getCoffees(): Promise<Coffee[]> {
  try {
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Advertencia en getCoffees: error al consultar Supabase', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Advertencia en getCoffees: error inesperado', error);
    return [];
  }
}

/**
 * Crea un nuevo café en la base de datos.
 * @param coffee Estructura del café a crear.
 * @returns El café creado o null si falló.
 */
export async function createCoffee(
  coffee: Database['public']['Tables']['coffees']['Insert'],
): Promise<Coffee | null> {
  try {
    const { data, error } = await supabase.from('coffees').insert(coffee).select().single();

    if (error) {
      console.warn('Advertencia en createCoffee: error al insertar en Supabase', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Advertencia en createCoffee: error inesperado', error);
    return null;
  }
}

/**
 * Elimina un café por su ID.
 * @param coffeeId ID del café a eliminar.
 * @returns true si se eliminó con éxito, false en caso contrario.
 */
export async function deleteCoffee(coffeeId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('coffees').delete().eq('id', coffeeId);

    if (error) {
      console.warn('Advertencia en deleteCoffee: error al eliminar en Supabase', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Advertencia en deleteCoffee: error inesperado', error);
    return false;
  }
}
