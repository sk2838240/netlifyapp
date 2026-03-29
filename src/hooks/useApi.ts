import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Content, ContentInput } from '../types';

export function useContent() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getContent(type);
      setItems(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBySlug = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getContentBySlug(slug);
      return res.data as Content;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: ContentInput) => {
    try {
      const res = await api.createContent(data);
      return res.data as Content;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<ContentInput>) => {
    try {
      const res = await api.updateContent(id, data);
      return res.data as Content;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await api.deleteContent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  return { items, loading, error, fetchAll, fetchBySlug, create, update, remove };
}

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: any) => {
    const res = await api.createCategory(data);
    setCategories((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const update = useCallback(async (id: string, data: any) => {
    const res = await api.updateCategory(id, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    return res.data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, loading, fetch, create, update, remove };
}

export function useTags() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTags();
      setTags(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: any) => {
    const res = await api.createTag(data);
    setTags((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const update = useCallback(async (id: string, data: any) => {
    const res = await api.updateTag(id, data);
    setTags((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tags, loading, fetch, create, update, remove };
}

export function useFAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (pageId?: string) => {
    setLoading(true);
    try {
      const res = await api.getFAQs(pageId);
      setFaqs(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: any) => {
    const res = await api.createFAQ(data);
    setFaqs((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const update = useCallback(async (id: string, data: any) => {
    const res = await api.updateFAQ(id, data);
    setFaqs((prev) => prev.map((f) => (f.id === id ? res.data : f)));
    return res.data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteFAQ(id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { faqs, loading, fetch, create, update, remove };
}
