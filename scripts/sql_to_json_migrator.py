#!/usr/bin/env python3
"""
Script para migrar datos de SQL a JSON para Bar Cachón
Procesa el dump SQL y genera el archivo menu-data.json optimizado con estructura híbrida
"""

import re
import json
import unicodedata
from datetime import datetime
from typing import Dict, List, Any

class SQLToJSONMigrator:
    def __init__(self, sql_file_path: str):
        self.sql_file_path = sql_file_path
        self.items = {}  # Diccionario de items por ID
        
        # Configuración de secciones principales
        self.main_sections_config = {
            'carta': {'id': 'carta', 'type': 'food', 'icon': '🍽️', 'order': 1,
                     'translations': {'es': 'Carta', 'eu': 'Karta', 'en': 'Menu', 'fr': 'Carte'}},
            'bebidas': {'id': 'bebidas', 'type': 'drink', 'icon': '🥤', 'order': 2,
                       'translations': {'es': 'Bebidas', 'eu': 'Edariak', 'en': 'Drinks', 'fr': 'Boissons'}},
            'menu': {'id': 'menu', 'type': 'daily-menu', 'icon': '📋', 'order': 3,
                    'translations': {'es': 'Menú', 'eu': 'Menua', 'en': 'Daily Menu', 'fr': 'Menu du Jour'}}
        }
        
        # Mapeo: tabla_sql -> (cat_id, main_section, icon, order, es, eu, en, fr, pricing_type)
        self.category_mapping = {
            'Para_picar': ('para-picar', 'carta', '🍽️', 1, 'Para Picar', 'Pikoteko', 'Appetizers', 'Apéritifs', 'unit-half-full'),
            'Pintxos': ('pintxos', 'carta', '🥘', 2, 'Pintxos', 'Pintxoak', 'Pintxos', 'Pintxos', 'unit-portion'),
            'Brochetas': ('brochetas', 'carta', '串', 3, 'Brochetas', 'Brotxetak', 'Skewers', 'Brochettes', 'single'),
            'Para_compartir': ('para-compartir', 'carta', '🍲', 4, 'Para Compartir', 'Partekatzeko', 'Sharing Plates', 'Plats à Partager', 'single'),
            'Tostadas': ('tostadas', 'carta', '🍞', 5, 'Tostas', 'Tostak', 'Toasts', 'Tartines', 'single'),
            'Sandwiches': ('sandwiches', 'carta', '🥪', 6, 'Sandwiches', 'Sandwiches', 'Sandwiches', 'Sandwiches', 'single'),
            'Hamburguesas': ('hamburguesas', 'carta', '🍔', 7, 'Hamburguesas', 'Hanburgesak', 'Burgers', 'Burgers', 'single'),
            'Bocadillos': ('bocadillos', 'carta', '🥖', 8, 'Bocadillos', 'Ogitartekoak', 'Baguettes', 'Sandwiches', 'single'),
            'Ensaladas': ('ensaladas', 'carta', '🥗', 9, 'Ensaladas', 'Entxaladak', 'Salads', 'Salades', 'single'),
            'Platos_combinados': ('platos-combinados', 'carta', '🍽️', 10, 'Platos Combinados', 'Plater Konbinatuak', 'Combo Dishes', 'Plats Combinés', 'single'),
            'Menu_del_dia': ('menu-del-dia', 'menu', '📋', 1, 'Menú del Día', 'Eguneko Menua', 'Daily Menu', 'Menu du Jour', 'menu'),
            'Menu_infantil': ('menu-infantil', 'menu', '👶', 2, 'Menú Infantil', 'Haurren Menua', 'Kids Menu', 'Menu Enfant', 'single'),
            'Postres': ('postres', 'menu', '🍰', 3, 'Postres', 'Postreak', 'Desserts', 'Desserts', 'single'),
            'Cafes': ('cafes', 'bebidas', '☕', 1, 'Cafés', 'Kafeak', 'Coffees', 'Cafés', 'single'),
            'Refrescos': ('refrescos', 'bebidas', '🥤', 2, 'Refrescos', 'Freskagarriak', 'Soft Drinks', 'Rafraîchissements', 'single'),
            'Cervezas': ('cervezas', 'bebidas', '🍺', 3, 'Cervezas', 'Garagardoak', 'Beers', 'Bières', 'small-large'),
            'Vinos': ('vinos', 'bebidas', '🍷', 4, 'Vinos', 'Ardoak', 'Wines', 'Vins', 'glass-bottle'),
            'Apertitivos_digestivos_finos': ('aperitivos', 'bebidas', '🥃', 5, 'Aperitivos', 'Aperitiboak', 'Aperitifs', 'Apéritifs', 'small-large'),
            'Copas': ('copas-licores', 'bebidas', '🍸', 6, 'Copas y Licores', 'Kopak eta Likoreak', 'Cocktails & Liquors', 'Cocktails et Liqueurs', 'dual'),
            'Combinados_licores': ('combinados', 'bebidas', '🍹', 7, 'Combinados', 'Konbinatuak', 'Mixed Drinks', 'Combinés', 'single'),
        }
    
    def parse_sql_inserts(self, table_name: str, sql_content: str) -> List[List]:
        """Extrae los datos INSERT de una tabla"""
        pattern = rf"INSERT INTO `{table_name}`.*?VALUES\s*(.*?);"
        matches = re.findall(pattern, sql_content, re.DOTALL | re.IGNORECASE)
        
        if not matches:
            return []
        
        all_rows = []
        for match in matches:
            rows_pattern = r'\((.*?)\)(?=,\s*\(|;|$)'
            rows = re.findall(rows_pattern, match, re.DOTALL)
            
            for row in rows:
                values = []
                value_pattern = r"'((?:[^']|'')*)'|(\d+\.?\d*)|NULL"
                for val_match in re.finditer(value_pattern, row):
                    if val_match.group(1) is not None:
                        values.append(val_match.group(1).replace("''", "'"))
                    elif val_match.group(2) is not None:
                        values.append(float(val_match.group(2)) if '.' in val_match.group(2) else int(val_match.group(2)))
                    else:
                        values.append(None)
                
                if values:
                    all_rows.append(values)
        
        return all_rows
    
    def get_column_names(self, table_name: str, sql_content: str) -> List[str]:
        """Extrae nombres de columnas de CREATE TABLE"""
        pattern = rf"CREATE TABLE `{table_name}`\s*\((.*?)\)\s*ENGINE"
        match = re.search(pattern, sql_content, re.DOTALL | re.IGNORECASE)
        
        if not match:
            return []
        
        columns = []
        for line in match.group(1).split('\n'):
            line = line.strip()
            if line.startswith('`'):
                col_match = re.match(r'`(\w+)`', line)
                if col_match:
                    columns.append(col_match.group(1))
        
        return columns
    
    def create_slug(self, text: str) -> str:
        """Crea un slug URL-friendly"""
        text = unicodedata.normalize('NFKD', text)
        text = text.encode('ascii', 'ignore').decode('ascii')
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')
    
    def create_translation(self, row_dict: Dict, lang: str) -> Dict:
        """Crea objeto de traducción para un idioma"""
        lang_suffix = 'eusk' if lang == 'eu' else lang
        
        name = row_dict.get(f'nombre_{lang_suffix}') or row_dict.get(f'primer_plato_{lang_suffix}') or ''
        description = row_dict.get(f'descripcion_{lang_suffix}')
        
        # Para menú del día, combinar platos
        if 'segundo_plato' in str(row_dict.keys()):
            segundo = row_dict.get(f'segundo_plato_{lang_suffix}')
            if segundo:
                description = f"{description or ''}\n{segundo}".strip()
        
        extras = row_dict.get(f'descripcion_extra_{lang_suffix}')
        
        result = {'name': name}
        if description:
            result['description'] = description
        if extras:
            result['extras'] = extras
        
        return result
    
    def extract_price(self, row_dict: Dict, pricing_type: str) -> Dict:
        """Extrae y estructura precios según el tipo"""
        values = {}
        
        if pricing_type == 'single':
            if row_dict.get('precio'):
                values['single'] = float(row_dict['precio'])
        
        elif pricing_type == 'unit-portion':
            if row_dict.get('precio_unidad'):
                values['unit'] = float(row_dict['precio_unidad'])
            if row_dict.get('precio_racion'):
                values['fullPortion'] = float(row_dict['precio_racion'])
        
        elif pricing_type == 'unit-half-full':
            if row_dict.get('precio_unidad'):
                values['unit'] = float(row_dict['precio_unidad'])
            if row_dict.get('precio_media_racion'):
                values['halfPortion'] = float(row_dict['precio_media_racion'])
            if row_dict.get('precio_racion'):
                values['fullPortion'] = float(row_dict['precio_racion'])
        
        elif pricing_type == 'small-large':
            if row_dict.get('precio_pequenyo'):
                values['small'] = float(row_dict['precio_pequenyo'])
            if row_dict.get('precio_grande'):
                values['large'] = float(row_dict['precio_grande'])
            if not values and row_dict.get('precio'):
                values['single'] = float(row_dict['precio'])
        
        elif pricing_type == 'glass-bottle':
            if row_dict.get('precio_copa'):
                values['glass'] = float(row_dict['precio_copa'])
            if row_dict.get('precio_botella'):
                values['bottle'] = float(row_dict['precio_botella'])
        
        elif pricing_type == 'dual':
            if row_dict.get('precio'):
                values['single'] = float(row_dict['precio'])
            if row_dict.get('precio_grande'):
                values['large'] = float(row_dict['precio_grande'])
        
        elif pricing_type == 'menu':
            if row_dict.get('precio'):
                values['menu'] = float(row_dict['precio'])
        
        return {'type': pricing_type, 'currency': 'EUR', 'values': values}
    
    def process_table_data(self, table_name: str, sql_content: str):
        """Procesa una tabla y añade items al diccionario"""
        if table_name not in self.category_mapping:
            return
        
        cat_id, main_section_id, icon, order, es, eu, en, fr, pricing_type = self.category_mapping[table_name]
        columns = self.get_column_names(table_name, sql_content)
        rows = self.parse_sql_inserts(table_name, sql_content)
        
        if not columns or not rows:
            return
        
        for idx, row_values in enumerate(rows):
            row_dict = dict(zip(columns, row_values))
            name_es = row_dict.get('nombre_es', '') or row_dict.get('primer_plato_es', '')
            slug = self.create_slug(name_es)
            item_id = f"{cat_id}-{str(idx + 1).zfill(3)}"
            
            # Crear traducciones
            trans_es = self.create_translation(row_dict, 'es')
            trans_eu = self.create_translation(row_dict, 'eu')
            trans_en = self.create_translation(row_dict, 'en')
            trans_fr = self.create_translation(row_dict, 'fr')
            
            # Limpiar traducciones vacías
            trans_es = {k: v for k, v in trans_es.items() if v}
            trans_eu = {k: v for k, v in trans_eu.items() if v}
            trans_en = {k: v for k, v in trans_en.items() if v}
            trans_fr = {k: v for k, v in trans_fr.items() if v}
            
            # Si inglés o francés están vacíos, usar español como fallback
            if not trans_en.get('name'):
                trans_en = trans_es.copy()
            if not trans_fr.get('name'):
                trans_fr = trans_es.copy()
            
            item = {
                'id': item_id,
                'slug': slug,
                'categoryId': cat_id,
                'mainSectionId': main_section_id,
                'translations': {
                    'es': trans_es,
                    'eu': trans_eu,
                    'en': trans_en,
                    'fr': trans_fr
                },
                'pricing': self.extract_price(row_dict, pricing_type),
                'available': True,
                'featured': False,
                'order': idx + 1
            }
            
            self.items[item_id] = item
    
    def create_navigation_structure(self) -> Dict:
        """Crea la estructura de navegación jerárquica"""
        main_sections = []
        
        for section_id, section_config in self.main_sections_config.items():
            categories = []
            
            for table_name, (cat_id, main_section, icon, order, es, eu, en, fr, pricing_type) in self.category_mapping.items():
                if main_section == section_id:
                    item_ids = [item_id for item_id, item in self.items.items() if item['categoryId'] == cat_id]
                    
                    categories.append({
                        'id': cat_id,
                        'icon': icon,
                        'order': order,
                        'translations': {'es': es, 'eu': eu, 'en': en, 'fr': fr},
                        'itemIds': sorted(item_ids, key=lambda x: self.items[x]['order'])
                    })
            
            categories.sort(key=lambda x: x['order'])
            
            main_sections.append({
                'id': section_config['id'],
                'type': section_config['type'],
                'icon': section_config['icon'],
                'order': section_config['order'],
                'translations': section_config['translations'],
                'categories': categories
            })
        
        return {'mainSections': sorted(main_sections, key=lambda x: x['order'])}
    
    def migrate(self, output_path: str):
        """Ejecuta la migración completa"""
        print("🚀 Iniciando migración SQL → JSON...\n")
        
        print(f"📖 Leyendo archivo: {self.sql_file_path}")
        with open(self.sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("\n📊 Procesando tablas y creando items...")
        for table_name in self.category_mapping.keys():
            item_count_before = len(self.items)
            self.process_table_data(table_name, sql_content)
            items_added = len(self.items) - item_count_before
            if items_added > 0:
                print(f"   ✓ {table_name}: {items_added} items")
        
        print("\n📁 Creando estructura de navegación...")
        navigation = self.create_navigation_structure()
        print(f"   ✓ {len(navigation['mainSections'])} secciones principales")
        total_categories = sum(len(section['categories']) for section in navigation['mainSections'])
        print(f"   ✓ {total_categories} categorías totales")
        
        menu_data = {
            'navigation': navigation,
            'items': self.items,
            'metadata': {
                'version': '2.0.0',
                'lastUpdated': datetime.now().isoformat(),
                'languages': ['es', 'eu', 'en', 'fr'],
                'defaultLanguage': 'es',
                'restaurantInfo': {
                    'name': 'Bar Cachón',
                    'website': 'https://barcachon.com'
                }
            }
        }
        
        print(f"\n💾 Guardando archivo: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(menu_data, f, ensure_ascii=False, indent=2)
        
        print("\n✅ Migración completada exitosamente!")
        print(f"📊 Resumen:")
        print(f"   • Secciones principales: {len(navigation['mainSections'])}")
        print(f"   • Categorías totales: {total_categories}")
        print(f"   • Items totales: {len(self.items)}")
        print(f"   • Archivo: {output_path}")
        
        print(f"\n📈 Distribución por sección:")
        for section in navigation['mainSections']:
            section_items = [i for i in self.items.values() if i['mainSectionId'] == section['id']]
            print(f"   • {section['translations']['es']}: {len(section_items)} items en {len(section['categories'])} categorías")


def main():
    import os
    
    sql_file = r"c:\Users\gilen\Downloads\u703362482_cachon.sql"
    output_file = r"c:\Users\gilen\Desktop\BARCACHON\barcachon\lib\menu-data.json"
    
    if not os.path.exists(sql_file):
        print(f"❌ Error: No se encuentra el archivo SQL en {sql_file}")
        return
    
    migrator = SQLToJSONMigrator(sql_file)
    migrator.migrate(output_file)


if __name__ == '__main__':
    main()
