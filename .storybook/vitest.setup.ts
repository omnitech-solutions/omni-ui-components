import { setProjectAnnotations } from '@storybook/react-vite';
import * as previewAnnotations from './preview';

// Apply the Storybook preview (decorators, globals) to every story run by `pnpm test:stories`.
setProjectAnnotations([previewAnnotations]);
