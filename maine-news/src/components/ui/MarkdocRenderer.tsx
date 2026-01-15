import React from 'react';
import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc';

interface MarkdocRendererProps {
    content: { node: RenderableTreeNode };
}

export default function MarkdocRenderer({ content }: MarkdocRendererProps) {
    const { node } = content;

    // Render the Markdoc AST to React elements on the server
    const renderedContent = Markdoc.renderers.react(node, React);

    return <>{renderedContent}</>;
}
