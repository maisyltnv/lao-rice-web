"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import type { ApiCategory } from "@/lib/api-types";
import {
  apiListCategories,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  isApiConfigured,
} from "@/lib/api";

type FormState = {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
  parent_id: string;
};

const emptyForm = (): FormState => ({
  name: "",
  slug: "",
  description: "",
  sort_order: "0",
  is_active: true,
  parent_id: "",
});

function categoryToForm(c: ApiCategory): FormState {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    sort_order: String(c.sort_order ?? 0),
    is_active: Boolean(c.is_active),
    parent_id:
      c.parent_id != null && c.parent_id !== undefined
        ? String(c.parent_id)
        : "",
  };
}

export default function AdminCategoriesPage() {
  const { adminToken, isReady } = useAuth();
  const [items, setItems] = useState<ApiCategory[]>([]);
  const [roots, setRoots] = useState<ApiCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [rootsOnly, setRootsOnly] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoadError("ບໍ່ມີ NEXT_PUBLIC_API_URL");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [list, rootList] = await Promise.all([
        apiListCategories(rootsOnly ? { roots_only: true } : undefined),
        apiListCategories({ roots_only: true }),
      ]);
      setItems(list);
      setRoots(rootList);
    } catch {
      setLoadError("ໂຫຼດ /categories ບໍ່ສຳເລັດ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [rootsOnly]);

  useEffect(() => {
    if (!isReady) return;
    void loadCategories();
  }, [isReady, loadCategories]);

  const openCreate = () => {
    setActionError(null);
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (c: ApiCategory) => {
    setActionError(null);
    setEditingId(c.id);
    setForm(categoryToForm(c));
    setDialogOpen(true);
  };

  const parentOptions = roots.filter((r) => r.id !== editingId);

  const handleSubmit = async () => {
    setActionError(null);
    if (!isApiConfigured()) {
      setActionError("ບໍ່ມີ API URL");
      return;
    }
    if (!adminToken) {
      setActionError("ຕ້ອງເຂົ້າລະບົບແອັດມິນ");
      return;
    }
    const name = form.name.trim();
    const slug = form.slug.trim();
    if (!name || !slug) {
      setActionError("ກະລຸນາໃສ່ຊື່ ແລະ slug");
      return;
    }
    const sort_order = parseInt(form.sort_order, 10);
    if (Number.isNaN(sort_order)) {
      setActionError("ລຳດັບຕ້ອງເປັນຕົວເລກ");
      return;
    }
    let parent_id: number | null = null;
    if (form.parent_id.trim() !== "") {
      const p = parseInt(form.parent_id, 10);
      if (Number.isNaN(p)) {
        setActionError("parent_id ບໍ່ຖືກຕ້ອງ");
        return;
      }
      parent_id = p;
    }

    setSaving(true);
    try {
      if (editingId != null) {
        await apiUpdateCategory(editingId, {
          name,
          slug,
          description: form.description.trim(),
          sort_order,
          is_active: form.is_active,
          parent_id,
        });
      } else {
        await apiCreateCategory({
          name,
          slug,
          description: form.description.trim(),
          sort_order,
          is_active: form.is_active,
          parent_id,
        });
      }
      setDialogOpen(false);
      setEditingId(null);
      await loadCategories();
    } catch {
      setActionError(
        editingId != null
          ? "ອັບເດດໝວດໝູ່ບໍ່ສຳເລັດ — ກວດ JWT ແລະຂໍ້ມູນ"
          : "ສ້າງໝວດໝູ່ບໍ່ສຳເລັດ — ກວດ JWT ແລະຂໍ້ມູນ"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: ApiCategory) => {
    if (!confirm(`ລຶບໝວດໝູ່ "${c.name}" ບໍ?`)) return;
    if (!adminToken || !isApiConfigured()) {
      setLoadError("ຕ້ອງເຂົ້າລະບົບແອັດມິນ ແລະ ມີ API");
      return;
    }
    setActionError(null);
    try {
      await apiDeleteCategory(c.id);
      await loadCategories();
    } catch {
      setActionError("ລຶບໝວດໝູ່ບໍ່ສຳເລັດ");
    }
  };

  return (
    <div>
      {(loadError || actionError) && (
        <div className="mb-4 space-y-2">
          {loadError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {loadError}
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {actionError}
            </div>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ໝວດໝູ່ສິນຄ້າ</h1>
          <p className="text-muted-foreground">
            CRUD ກັບ API — GET /categories, POST/PUT/DELETE ຕ້ອງໃຊ້ JWT ແອັດມິນ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRootsOnly((v) => !v)}
            className={rootsOnly ? "border-primary" : ""}
          >
            {rootsOnly ? "ສະແດງສະເພາະລະດັບເທິງ" : "ສະແດງທັງໝົດ (ຕາມ API)"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadCategories()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            ໂຫຼດໃໝ່
          </Button>
          <Button onClick={openCreate} disabled={!adminToken}>
            <Plus className="mr-2 h-4 w-4" />
            ເພີ່ມໝວດໝູ່
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">ຊື່</TableHead>
              <TableHead>slug</TableHead>
              <TableHead>ລຳດັບ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
              <TableHead className="text-right pr-4">ຈັດການ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  ບໍ່ມີຂໍ້ມູນ — ກົດ &quot;ເພີ່ມໝວດໝູ່&quot; ຫຼື ກວດ backend
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-4 font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {c.slug}
                  </TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell>
                    {c.is_active ? (
                      <Badge variant="secondary">ເປີດ</Badge>
                    ) : (
                      <Badge variant="outline">ປິດ</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(c)}
                      disabled={!adminToken}
                      aria-label="ແກ້ໄຂ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(c)}
                      disabled={!adminToken}
                      aria-label="ລຶບ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId != null ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່"}
            </DialogTitle>
            <DialogDescription>
              ກົດບັນທຶກເພື່ອສົ່ງໄປ POST ຫຼື PUT /categories
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">ຊື່</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="ຊື່ໝວດໝູ່"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-slug">slug (URL)</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="home-goods"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-desc">ລາຍລະອຽດ</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="ຄຳອະທິບາຍສັ້ນໆ"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-sort">ລຳດັບການສະແດງ (sort_order)</Label>
              <Input
                id="cat-sort"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>ໝວດແມ່ (ທາງເລືອກ)</Label>
              <Select
                value={form.parent_id === "" ? "__none__" : form.parent_id}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    parent_id: v === "__none__" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— ບໍ່ມີໝວດແມ່ —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— ບໍ່ມີໝວດແມ່ —</SelectItem>
                  {parentOptions.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name} ({r.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
              <Label htmlFor="cat-active" className="cursor-pointer">
                ເປີດໃຊ້ງານ (is_active)
              </Label>
              <Switch
                id="cat-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              type="button"
            >
              ຍົກເລີກ
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={saving}>
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
