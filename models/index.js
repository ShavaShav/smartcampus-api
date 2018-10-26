// Export a Neode Instance
var NeodeDriver = require("neode");

/**
 * Our Neode definitions. Since library is a WIP, it's missing a lot
 * of common queries. We can define them here until they are implemented.
 */

/**
 * Counts the number of a given relation to a given node 
 * WARNING: Bi-directional counts as 2 relations
 * ex. countRelations(Event node, 'LIKES') returns number of likes
 * @param {Neode obj} node 
 * @param {Relation label} relationship 
 */
if (typeof NeodeDriver.countRelations === 'undefined') {
  NeodeDriver.prototype.countRelations = (node, relationship) => {
    const nodeLabel = node.labels()[0];
    const nodeId = node.identity();

    // get related nodes through raw cypher query
    return Neode.cypher(
        'MATCH (n:' + nodeLabel + ')-[' + relationship + ']-(r) ' + 
        'WHERE ID(n)=' + nodeId + ' ' + 
        'RETURN COUNT(r)'
    );
  }
}

/**
 * Gets all node related through relationship label.
 * @param {Neode obj} node 
 * @param {Relation label} relationship 
 */
if (typeof NeodeDriver.getRelatedNodes === 'undefined') {
  NeodeDriver.prototype.getRelatedNodes = (node, relationship) => {
    const nodeLabel = node.labels()[0];
    const nodeId = node.identity();

    // get related nodes through raw cypher query
    return Neode.cypher(
        'MATCH (n:' + nodeLabel + ')-[' + relationship + ']-(r) ' + 
        'WHERE ID(n)=' + nodeId + ' ' + 
        'RETURN r'
    );
  }
}

/**
 * Removes the relation between two nodes
 * @param {Neode obj} node 
 * @param {Neode obj} otherNode 
 * @param {Relation label} relationship 
 */
if (typeof NeodeDriver.removeRelation === 'undefined') {
  NeodeDriver.prototype.removeRelation = (node, otherNode, relationship) => {
    const nodeLabel = node.labels()[0];
    const nodeId = node.identity();
  
    const otherNodeLabel = otherNode.labels()[0];
    const otherNodeId = otherNode.identity();
    return Neode.cypher(
      'MATCH (n:' + nodeLabel + ')-[r:' + relationship + ']-(o:' + otherNodeLabel + ') ' + 
      'WHERE ID(n)=' + nodeId + ' AND ID(o)=' + otherNodeId + ' ' +
      'DELETE r'
    );
  }
}

/**
 * Load up the models in this folder and export objects
 */

Neode = new NeodeDriver.fromEnv();
Neode.setEnterprise(process.env.NEO4J_ENTERPRISE == 'true'); // 
Neode.with({
  User: require("./user"),
  Event: require("./event")
});

// Export the models as well for convenience
const User = Neode.model('User');
const Event = Neode.model('Event');

module.exports = { Neode, User, Event };
