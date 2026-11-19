import { getCollection } from 'astro:content';

export const getProjects = async () =>
  (await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft)).sort((a, b) => a.data.order - b.data.order);

export const getProcess = async () => (await getCollection('process')).sort((a, b) => a.data.order - b.data.order);

export const kindLabel = (k: 'concepto' | 'real') => (k === 'real' ? 'Proyecto real' : 'Concepto');
