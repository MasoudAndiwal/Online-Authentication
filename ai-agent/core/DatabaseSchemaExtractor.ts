/**
 * Database Schema Extractor
 * Parses SQL migration files and TypeScript models to extract complete database schema
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: string;
    onUpdate?: string;
  };
  defaultValue?: string;
  check?: string;
  unique?: boolean;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
  indexes: IndexDefinition[];
  constraints: ConstraintDefinition[];
  triggers: TriggerDefinition[];
  comments?: string;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
  type?: string;
}

export interface ConstraintDefinition {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  definition: string;
}

export interface TriggerDefinition {
  name: string;
  timing: 'BEFORE' | 'AFTER';
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  function: string;
}

export interface FunctionDefinition {
  name: string;
  parameters: string[];
  returnType: string;
  body: string;
  language: string;
}

export interface DatabaseSchema {
  tables: TableSchema[];
  functions: FunctionDefinition[];
  views: ViewDefinition[];
  enums: EnumDefinition[];
}

export interface ViewDefinition {
  name: string;
  definition: string;
  materialized: boolean;
}

export interface EnumDefinition {
  name: string;
  values: string[];
}

export class DatabaseSchemaExtractor {
  async extractFromMigrations(migrationDir: string): Promise<DatabaseSchema> {
    const files = await fs.readdir(migrationDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    const schema: DatabaseSchema = {
      tables: [],
      functions: [],
      views: [],
      enums: []
    };

    for (const file of sqlFiles) {
      const filePath = path.join(migrationDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      this.parseSQLFile(content, schema);
    }

    return schema;
  }

  private parseSQLFile(content: string, schema: DatabaseSchema): void {
    // Remove comments
    const cleanContent = this.removeComments(content);

    // Extract CREATE TABLE statements
    const tableMatches = cleanContent.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi);
    for (const match of tableMatches) {
      const tableName = match[1];
      const tableBody = match[2];
      const table = this.parseTableDefinition(tableName, tableBody);
      
      // Update existing or add new
      const existingIndex = schema.tables.findIndex(t => t.name === tableName);
      if (existingIndex >= 0) {
        schema.tables[existingIndex] = table;
      } else {
        schema.tables.push(table);
      }
    }

    // Extract CREATE INDEX statements
    const indexMatches = cleanContent.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([\s\S]*?)\);/gi);
    for (const match of indexMatches) {
      const indexName = match[1];
      const tableName = match[2];
      const columns = match[3].split(',').map(c => c.trim());
      const unique = match[0].toLowerCase().includes('unique');

      const table = schema.tables.find(t => t.name === tableName);
      if (table) {
        table.indexes.push({
          name: indexName,
          columns,
          unique
        });
      }
    }

    // Extract CREATE FUNCTION statements
    const functionMatches = cleanContent.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)\s*\(([\s\S]*?)\)\s*RETURNS\s+([\s\S]*?)\s+AS\s+\$[\s\S]*?\$([\s\S]*?)\$\s+LANGUAGE\s+(\w+);/gi);
    for (const match of functionMatches) {
      const functionName = match[1];
      const params = match[2];
      const returnType = match[3].trim();
      const body = match[4];
      const language = match[5];

      schema.functions.push({
        name: functionName,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean),
        returnType,
        body,
        language
      });
    }

    // Extract CREATE VIEW statements
    const viewMatches = cleanContent.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW\s+(\w+)\s+AS\s+([\s\S]*?);/gi);
    for (const match of viewMatches) {
      const viewName = match[1];
      const definition = match[2].trim();
      const materialized = match[0].toLowerCase().includes('materialized');

      schema.views.push({
        name: viewName,
        definition,
        materialized
      });
    }

    // Extract COMMENT statements
    const commentMatches = cleanContent.matchAll(/COMMENT\s+ON\s+(?:TABLE|COLUMN)\s+([\w.]+)\s+IS\s+'([^']+)';/gi);
    for (const match of commentMatches) {
      const target = match[1];
      const comment = match[2];

      if (target.includes('.')) {
        // Column comment
        const [tableName, columnName] = target.split('.');
        const table = schema.tables.find(t => t.name === tableName);
        if (table) {
          const column = table.columns.find(c => c.name === columnName);
          if (column) {
            (column as any).comment = comment;
          }
        }
      } else {
        // Table comment
        const table = schema.tables.find(t => t.name === target);
        if (table) {
          table.comments = comment;
        }
      }
    }
  }

  private parseTableDefinition(tableName: string, tableBody: string): TableSchema {
    const columns: TableColumn[] = [];
    const constraints: ConstraintDefinition[] = [];

    // Split by comma, but respect parentheses
    const lines = this.splitTableBody(tableBody);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if it's a constraint
      if (trimmed.toUpperCase().startsWith('CONSTRAINT') || 
          trimmed.toUpperCase().startsWith('PRIMARY KEY') ||
          trimmed.toUpperCase().startsWith('FOREIGN KEY') ||
          trimmed.toUpperCase().startsWith('UNIQUE') ||
          trimmed.toUpperCase().startsWith('CHECK')) {
        constraints.push(this.parseConstraint(trimmed));
      } else {
        // It's a column definition
        const column = this.parseColumnDefinition(trimmed);
        if (column) {
          columns.push(column);
        }
      }
    }

    return {
      name: tableName,
      columns,
      indexes: [],
      constraints,
      triggers: []
    };
  }

  private parseColumnDefinition(line: string): TableColumn | null {
    // Match: column_name TYPE [constraints]
    const match = line.match(/^(\w+)\s+([A-Z]+(?:\([^)]+\))?(?:\s+WITH\s+TIME\s+ZONE)?)(.*)/i);
    if (!match) return null;

    const name = match[1];
    const type = match[2].trim();
    const rest = match[3].trim();

    const column: TableColumn = {
      name,
      type,
      nullable: !rest.toUpperCase().includes('NOT NULL'),
      primaryKey: rest.toUpperCase().includes('PRIMARY KEY'),
      unique: rest.toUpperCase().includes('UNIQUE')
    };

    // Extract DEFAULT
    const defaultMatch = rest.match(/DEFAULT\s+([^,\s]+(?:\([^)]*\))?)/i);
    if (defaultMatch) {
      column.defaultValue = defaultMatch[1];
    }

    // Extract REFERENCES (foreign key)
    const referencesMatch = rest.match(/REFERENCES\s+(\w+)\s*\((\w+)\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?(?:\s+ON\s+UPDATE\s+(\w+(?:\s+\w+)?))?/i);
    if (referencesMatch) {
      column.foreignKey = {
        table: referencesMatch[1],
        column: referencesMatch[2],
        onDelete: referencesMatch[3],
        onUpdate: referencesMatch[4]
      };
    }

    // Extract CHECK constraint
    const checkMatch = rest.match(/CHECK\s*\(([^)]+)\)/i);
    if (checkMatch) {
      column.check = checkMatch[1];
    }

    return column;
  }

  private parseConstraint(line: string): ConstraintDefinition {
    const constraintMatch = line.match(/CONSTRAINT\s+(\w+)\s+(.*)/i);
    const name = constraintMatch ? constraintMatch[1] : 'unnamed';
    const definition = constraintMatch ? constraintMatch[2] : line;

    let type: ConstraintDefinition['type'] = 'CHECK';
    if (definition.toUpperCase().includes('PRIMARY KEY')) {
      type = 'PRIMARY KEY';
    } else if (definition.toUpperCase().includes('FOREIGN KEY')) {
      type = 'FOREIGN KEY';
    } else if (definition.toUpperCase().includes('UNIQUE')) {
      type = 'UNIQUE';
    }

    return {
      name,
      type,
      definition
    };
  }

  private splitTableBody(body: string): string[] {
    const lines: string[] = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      
      if (char === '(') {
        parenDepth++;
        current += char;
      } else if (char === ')') {
        parenDepth--;
        current += char;
      } else if (char === ',' && parenDepth === 0) {
        lines.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      lines.push(current.trim());
    }

    return lines;
  }

  private removeComments(sql: string): string {
    // Remove single-line comments
    let result = sql.replace(/--[^\n]*/g, '');
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    return result;
  }

  generateMarkdownDocumentation(schema: DatabaseSchema): string {
    let md = '# Database Schema Documentation\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `## Overview\n\n`;
    md += `- **Tables:** ${schema.tables.length}\n`;
    md += `- **Functions:** ${schema.functions.length}\n`;
    md += `- **Views:** ${schema.views.length}\n\n`;

    md += `## Tables\n\n`;
    for (const table of schema.tables) {
      md += `### ${table.name}\n\n`;
      if (table.comments) {
        md += `${table.comments}\n\n`;
      }

      md += `#### Columns\n\n`;
      md += `| Column | Type | Nullable | Constraints |\n`;
      md += `|--------|------|----------|-------------|\n`;
      
      for (const col of table.columns) {
        const constraints: string[] = [];
        if (col.primaryKey) constraints.push('PRIMARY KEY');
        if (col.unique) constraints.push('UNIQUE');
        if (col.foreignKey) constraints.push(`FK → ${col.foreignKey.table}(${col.foreignKey.column})`);
        if (col.check) constraints.push(`CHECK: ${col.check}`);
        if (col.defaultValue) constraints.push(`DEFAULT: ${col.defaultValue}`);

        md += `| ${col.name} | ${col.type} | ${col.nullable ? 'Yes' : 'No'} | ${constraints.join(', ') || '-'} |\n`;
      }

      if (table.indexes.length > 0) {
        md += `\n#### Indexes\n\n`;
        for (const idx of table.indexes) {
          md += `- **${idx.name}**${idx.unique ? ' (UNIQUE)' : ''}: ${idx.columns.join(', ')}\n`;
        }
      }

      md += `\n`;
    }

    if (schema.functions.length > 0) {
      md += `## Functions\n\n`;
      for (const func of schema.functions) {
        md += `### ${func.name}\n\n`;
        md += `**Returns:** ${func.returnType}\n\n`;
        if (func.parameters.length > 0) {
          md += `**Parameters:**\n`;
          for (const param of func.parameters) {
            md += `- ${param}\n`;
          }
        }
        md += `\n`;
      }
    }

    if (schema.views.length > 0) {
      md += `## Views\n\n`;
      for (const view of schema.views) {
        md += `### ${view.name}${view.materialized ? ' (Materialized)' : ''}\n\n`;
        md += `\`\`\`sql\n${view.definition}\n\`\`\`\n\n`;
      }
    }

    return md;
  }

  generateMermaidERD(schema: DatabaseSchema): string {
    let mermaid = 'erDiagram\n';

    for (const table of schema.tables) {
      mermaid += `    ${table.name} {\n`;
      for (const col of table.columns) {
        const key = col.primaryKey ? 'PK' : col.foreignKey ? 'FK' : '';
        mermaid += `        ${col.type} ${col.name} ${key}\n`;
      }
      mermaid += `    }\n`;
    }

    // Add relationships
    for (const table of schema.tables) {
      for (const col of table.columns) {
        if (col.foreignKey) {
          mermaid += `    ${table.name} ||--o{ ${col.foreignKey.table} : "${col.name}"\n`;
        }
      }
    }

    return mermaid;
  }
}
