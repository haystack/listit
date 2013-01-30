#!/usr/bin/env python
""" Imports a chrome heap dump as a graph (using igraph).  """
import igraph
from itertools import islice, repeat, chain, imap
import json
import sys

DEFAULT_FORMAT = "pickle"

__all__ = ("heap_import",)

class UnknownTypeException(Exception):
    def __init__(self, type_name, field_name=None):
        self.type_name = type_name
        self.field_name = field_name

        msg = "Error; Unknown type '{}'".format(type_name)
        if field_name:
            msg += " for field '{}'".format(field_name)
        msg += "."

        super(UnknownTypeException, self).__init__(msg)

def repeat_list(l):
    return chain.from_iterable(repeat(i, n) for i,n in enumerate(l))

def maybe_open(f):
    return f if hasattr(f, "read") else open(f)

def heap_import(heap_file):
    """
    Read the passed heap dump file into a graph.
    """
    with maybe_open(heap_file) as f:
        dump = json.load(f)

    strings = map(lambda s: s.encode('utf-8'), dump['strings'])
    string_count = len(strings)

    edges = dump['edges']
    edge_count = dump['snapshot']['edge_count']
    edge_fields = dump['snapshot']['meta']['edge_fields']
    edge_types = dump['snapshot']['meta']['edge_types']
    edge_field_count = len(edge_fields)
    edge_to_node_index = edge_fields.index('to_node')

    nodes = dump['nodes']
    node_count = dump['snapshot']['node_count']
    node_fields = dump['snapshot']['meta']['node_fields']
    node_types = dump['snapshot']['meta']['node_types']
    node_field_count = len(node_fields)
    node_edge_count_index = node_fields.index('edge_count')
    node_id_index = node_fields.index('id')

    graph = igraph.Graph(directed=True)
    graph.add_vertices(node_count)
    for i, (field, ntype) in enumerate(zip(node_fields, node_types)):
        if field == 'edge_count':
            continue
        elif ntype == 'string':
            graph.vs[field] = map(strings.__getitem__, islice(nodes, i, None, node_field_count))
        elif ntype == 'number':
            graph.vs[field] = nodes[i::node_field_count]
        elif isinstance(ntype, list):
            graph.vs[field] = map(ntype.__getitem__, islice(nodes, i, None, node_field_count))
        else:
            raise UnknownTypeException(ntype, field)

    graph.add_edges(zip(
        repeat_list(islice(nodes, node_edge_count_index, None, node_field_count)),
        imap(lambda x: x/node_field_count, islice(edges, edge_to_node_index, None, edge_field_count))
    ))

    for i, (field, etype) in enumerate(zip(edge_fields, edge_types)):
        if field == 'to_node':
            continue
        elif isinstance(etype, list):
            graph.es[field] = map(etype.__getitem__, islice(edges, i, None, edge_field_count))
        elif etype == 'string_or_number':
            graph.es[field] = map(lambda (j,x): x if x >= string_count else strings[x],
                                  enumerate(islice(nodes, i, None, node_field_count)))
        else:
            raise UnknownTypeException(etype, field)

    return graph

def main(infile, outfile, fmt=None):
    if outfile == "-":
        outfile = sys.stdout
    heap_import(infile).write(outfile, format=fmt);

def parse_args():
    import argparse

    parser = argparse.ArgumentParser()

    parser.add_argument("-f", "--format",
                       dest="fmt",
                       metavar="FORMAT",
                       default=DEFAULT_FORMAT,
                       help="print format")

    parser.add_argument("infile", help="heap dump to parse")
    parser.add_argument("outfile", help="file to write")
    return parser.parse_args()

if __name__ == '__main__':
    main(**vars(parse_args()))
