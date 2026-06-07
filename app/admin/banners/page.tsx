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
import { useAuth } from "@/lib/auth";
import type { ApiBanner } from "@/lib/api-types";
import {
  apiAdminListBanners,
  apiCreateBanner,
  apiUpdateBanner,
  apiDeleteBanner,
  apiUploadBannerImage,
  isApiConfigured,
} from "@/lib/api";
import { BannerImage } from "@/components/banner/banner-image";
import {
  BannerImageField,
} from "@/components/admin/banner-image-field";
import type { ProductImageUploadValue } from "@/components/admin/product-image-field";
import { bannerImageSourceModeForUrl } from "@/lib/banner-upload-image";
import type { ProductImageSourceMode } from "@/lib/product-upload-image";
import { IMAGE_VIEWER_PAGE_WARNING, isImageViewerPageUrl } from "@/lib/product-image";

type FormState = {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  cta_label: string;
  link_url: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  cta_label: "ຊື້ດຽວນີ້",
  link_url: "/products",
  sort_order: "0",
  is_active: true,
});

function bannerToForm(b: ApiBanner): FormState {
  return {
    title: b.title,
    subtitle: b.subtitle ?? "",
    description: b.description ?? "",
    image_url: b.image_url,
    cta_label: b.cta_label ?? "",
    link_url: b.link_url ?? "/products",
    sort_order: String(b.sort_order ?? 0),
    is_active: Boolean(b.is_active),
  };
}

export default function AdminBannersPage() {
  const { adminToken, isReady } = useAuth();
  const [items, setItems] = useState<ApiBanner[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageSourceMode, setImageSourceMode] =
    useState<ProductImageSourceMode>("link");
  const [imageUpload, setImageUpload] = useState<ProductImageUploadValue | null>(
    null
  );

  const clearImageUpload = () => {
    if (imageUpload?.previewUrl) URL.revokeObjectURL(imageUpload.previewUrl);
    setImageUpload(null);
  };

  const resetImageFields = (url = "") => {
    clearImageUpload();
    setImageSourceMode(bannerImageSourceModeForUrl(url));
  };

  const loadBanners = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoadError("ບໍ່ມີ NEXT_PUBLIC_API_URL");
      return;
    }
    if (!adminToken) {
      setLoadError("ຕ້ອງເຂົ້າ /admin/login");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const list = await apiAdminListBanners();
      setItems(
        [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      );
    } catch {
      setLoadError("ໂຫຼດ GET /banners?include_inactive=true ບໍ່ສຳເລັດ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!isReady) return;
    void loadBanners();
  }, [isReady, loadBanners]);

  const openCreate = () => {
    setActionError(null);
    setEditingId(null);
    setForm(emptyForm());
    resetImageFields();
    setDialogOpen(true);
  };

  const openEdit = (b: ApiBanner) => {
    setActionError(null);
    setEditingId(b.id);
    setForm(bannerToForm(b));
    resetImageFields(b.image_url);
    setDialogOpen(true);
  };

  const resolveImageUrlForSave = async (): Promise<string | null> => {
    if (imageSourceMode === "link") {
      const trimmed = form.image_url.trim();
      if (!trimmed) {
        setActionError("ກະລຸນາໃສ່ URL ຮູບ");
        return null;
      }
      if (isImageViewerPageUrl(trimmed)) {
        setActionError(IMAGE_VIEWER_PAGE_WARNING);
        return null;
      }
      return trimmed;
    }

    if (imageUpload) {
      if (!isApiConfigured() || !adminToken) {
        setActionError(
          "ອັບໂຫຼດຮູບຕ້ອງເຊື່ອມ API ແລະ ເຂົ້າສູ່ລະບົບແອັດມິນ — ໄປ /admin/login"
        );
        return null;
      }
      try {
        return await apiUploadBannerImage(imageUpload.file);
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err.message
            : "ອັບໂຫຼດຮູບ banner ບໍ່ສຳເລັດ"
        );
        return null;
      }
    }

    const existing = form.image_url.trim();
    if (existing) return existing;
    setActionError("ກະລຸນາເລືອກຮູບ ຫຼື ວາງລິ້ງຮູບ");
    return null;
  };

  const handleSubmit = async () => {
    setActionError(null);
    if (!isApiConfigured() || !adminToken) {
      setActionError("ຕ້ອງເຂົ້າລະບົບແອດມິນ");
      return;
    }
    const title = form.title.trim();
    if (!title) {
      setActionError("ກະລຸນາໃສ່ຫົວຂໍ້");
      return;
    }
    const sort_order = parseInt(form.sort_order, 10);
    if (Number.isNaN(sort_order)) {
      setActionError("ລຳດັບຕ້ອງເປັນຕົວເລກ");
      return;
    }

    setSaving(true);
    try {
      const image_url = await resolveImageUrlForSave();
      if (!image_url) return;

      const body = {
        title,
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        image_url,
        cta_label: form.cta_label.trim(),
        link_url: form.link_url.trim() || "/products",
        sort_order,
        is_active: form.is_active,
      };

      if (editingId != null) {
        await apiUpdateBanner(editingId, body);
      } else {
        await apiCreateBanner(body);
      }
      clearImageUpload();
      setDialogOpen(false);
      setEditingId(null);
      await loadBanners();
    } catch {
      setActionError(
        editingId != null
          ? "ອັບເດດ banner ບໍ່ສຳເລັດ"
          : "ສ້າງ banner ບໍ່ສຳເລັດ"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: ApiBanner) => {
    if (!confirm(`ລຶບ slide "${b.title}" ບໍ?`)) return;
    if (!adminToken || !isApiConfigured()) return;
    setActionError(null);
    try {
      await apiDeleteBanner(b.id);
      await loadBanners();
    } catch {
      setActionError("ລຶບ banner ບໍ່ສຳເລັດ");
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
            <motion.div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {actionError}
            </motion.div>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ແບນເນີ Hero (Slider)
          </h1>
        </div>
        <motion.div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadBanners()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            ໂຫຼດຄືນ
          </Button>
          <Button onClick={openCreate} disabled={!adminToken}>
            <Plus className="mr-2 h-4 w-4" />
            ເພີ່ມ slide
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4 w-24">ຮູບ</TableHead>
              <TableHead>ຫົວຂໍ້</TableHead>
              <TableHead>ລິ້ງ</TableHead>
              <TableHead>ລຳດັບ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
              <TableHead className="text-right pr-4">ຈັດການ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  ຍັງບໍ່ມີ banner — ກົດ &quot;ເພີ່ມ slide&quot; ຫຼື ກວດ API
                </TableCell>
              </TableRow>
            ) : (
              items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="pl-4">
                    <div className="h-14 w-24 rounded-md overflow-hidden bg-muted">
                      <BannerImage
                        src={b.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{b.title}</p>
                    {b.subtitle ? (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {b.subtitle}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs max-w-[140px] truncate">
                    {b.link_url || "—"}
                  </TableCell>
                  <TableCell>{b.sort_order}</TableCell>
                  <TableCell>
                    {b.is_active ? (
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
                      onClick={() => openEdit(b)}
                      disabled={!adminToken}
                      aria-label="ແກ້ໄຂ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(b)}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) clearImageUpload();
          setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId != null ? "ແກ້ໄຂ slide" : "ເພີ່ມ slide ໃໝ່"}
            </DialogTitle>
            <DialogDescription>
              POST /banners ຫຼື PUT /banners/:id — ສະແດງໜ້າຫຼັກເມື່ອ is_active=true
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="banner-title">ຫົວຂໍ້ (title) *</Label>
              <Input
                id="banner-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="ສິນຄ້າໃໝ່ອາທິດນີ້"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-subtitle">ຂໍ້ຄວາມສັ້ນ (subtitle)</Label>
              <Input
                id="banner-subtitle"
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                placeholder="ສ່ວນຫຼຸດ 30%"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-desc">ລາຍລະອຽດ (description)</Label>
              <Textarea
                id="banner-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <BannerImageField
              mode={imageSourceMode}
              onModeChange={setImageSourceMode}
              imageUrl={form.image_url}
              onImageUrlChange={(url) =>
                setForm((f) => ({ ...f, image_url: url }))
              }
              uploadValue={imageUpload}
              onUploadValueChange={setImageUpload}
              disabled={saving}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="banner-cta">ປຸ່ມ (cta_label)</Label>
                <Input
                  id="banner-cta"
                  value={form.cta_label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cta_label: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="banner-link">ລິ້ງ (link_url)</Label>
                <Input
                  id="banner-link"
                  value={form.link_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link_url: e.target.value }))
                  }
                  placeholder="/products"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner-sort">ລຳດັບ (sort_order)</Label>
              <Input
                id="banner-sort"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
              <Label htmlFor="banner-active" className="cursor-pointer">
                ເປີດສະແດງ (is_active)
              </Label>
              <Switch
                id="banner-active"
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
              type="button"
              onClick={() => setDialogOpen(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
