/***
 * Accepts a list of nested arrays of relations. Each relation itself is an array which has a special recursive structure:<br>
 * 1st element (mandatory) is a relation name.<br>
 * 2nd element (optional) may be relation alias.<br>
 * If 2nd element is alias, then 3...n elements may be a list of child relations arrays with the same relation structure.
 * If relation doesn't have an alias, then 2...n elements may be a list of child relations.<br>
 * Child relations can also their own child relations which creates a recursive relation structure.<br>
 *
 * Examples:<br>
 * 1) Relation with a single name: ['brackhit'] -> 'brackhit'<br>
 * 2) Relation with an alias: ['brackhit', 'b'] -> 'brackhit as b'<br>
 * 3) Relation with alias and a child relation: ['brackhit', 'b', ['owner', 'bo']] -> [brackhit as b.[owner as bo]]<br>
 * 4) Relation with 2 child relations: ['brackhit', ['owner'], ['genre', 'g']] -> [brackhit.[owner, genre as g]]<br>
 * 5) Multiple relations: ['brackhit', ['owner', 'o']], ['user', 'u'] -> [brackhit.[owner as o], user as u]<br>
 */
export function expr(...relations: any[][]): string {
  const expr = relations.map((r) => parseRelation(r)).join(', ');
  return '[' + expr + ']';
}

function parseRelation(relation: any[]): string {
  if (!Array.isArray(relation) || relation.length === 0) {
    throw new Error(
      `Invalid relation: ${relation}. Relation must be an array containing at least one element!`,
    );
  }

  if (typeof relation[0] !== 'string') {
    throw new Error(
      `Invalid relation: [${relation}]. First element of relation array must be a string!`,
    );
  }

  let expr = relation[0];

  if (relation.length === 2 && typeof relation[1] === 'string') {
    expr = expr.concat(' as ', relation[1]); // add only alias to relation
  } else if (relation.length > 1) {
    if (typeof relation[1] === 'string') {
      const childrenExpr = getChildrenExpr(relation.slice(2, relation.length));
      expr = expr.concat(' as ', relation[1], '.', childrenExpr); // add alias and children to relation
    } else {
      const childrenExpr = getChildrenExpr(relation.slice(1, relation.length)); // add only children to relation
      expr = expr.concat('.', childrenExpr);
    }
  }

  return expr;
}

function getChildrenExpr(children: any[]) {
  children.forEach((r) => {
    if (!Array.isArray(r)) {
      throw new Error(`Invalid child relation: ${r}. Child relation must be an array!`);
    }
  });

  const expr = children.map((r) => parseRelation(r)).join(', ');

  return '[' + expr + ']';
}
