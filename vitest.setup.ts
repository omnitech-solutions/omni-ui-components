import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

(globalThis as typeof globalThis & { jest: typeof vi }).jest = vi;
