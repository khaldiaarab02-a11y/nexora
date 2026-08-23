"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

export type ProductImageRecord = {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

type StagedImage = {
  localId: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
};

export type ProductImagesManagerHandle = {
  // Called by the parent AFTER the product row exists (add-mode only), to
  // upload every staged file and link it to the new product. Returns the
  // primary image's public URL (or null) so the parent can also write it
  // to products.image_url.
  commitStagedImages: (productId: string, userId: string) => Promise<string | null>;
  hasStaged: () => boolean;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function extractStoragePath(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

type Props = {
  // null in "add product" mode (product does not exist yet).
  // the product's id in "edit product" mode (images upload immediately).
  productId: string | null;
  initialImages?: ProductImageRecord[];
  // Edit mode only: fired whenever the primary image changes, so the parent
  // page can keep its own local product.image_url state in sync.
  onPrimaryUrlChange?: (url: string | null) => void;
};

const ProductImagesManager = forwardRef<ProductImagesManagerHandle, Props>(function ProductImagesManager(
  { productId, initialImages = [], onPrimaryUrlChange },
  ref
) {
  const [images, setImages] = useState<ProductImageRecord[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { t } = useI18n();

  function validateFiles(fileList: FileList): { valid: File[]; error: string } {
    const valid: File[] = [];
    for (const file of Array.from(fileList)) {
      if (!file || file.size === 0) continue;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return { valid: [], error: t.feedback.imageTypeError };
      }
      if (file.size > MAX_SIZE) {
        return { valid: [], error: t.feedback.logoSizeError };
      }
      valid.push(file);
    }
    return { valid, error: "" };
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const { valid, error } = validateFiles(fileList);
    if (error) {
      setMessage(error);
      return;
    }
    if (valid.length === 0) {
      setMessage(t.productImages.noValidImage);
      return;
    }
    setMessage("");

    if (!productId) {
      // Add mode: no product row yet, keep files locally until submit.
      setStaged((prev) => {
        const hasPrimaryAlready = prev.some((s) => s.isPrimary);
        const additions = valid.map((file, i) => ({
          localId: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          isPrimary: !hasPrimaryAlready && i === 0,
        }));
        return [...prev, ...additions];
      });
      return;
    }

    // Edit mode: the product already exists, upload right away.
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setMessage(t.feedback.authRequired);
      toast.error(t.feedback.sessionExpired);
      setUploading(false);
      return;
    }

    const startOrder = images.length;
    const uploaded: ProductImageRecord[] = [];
    let uploadFailed = false;

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

      if (uploadError) {
        setMessage(`${t.productImages.uploadOneFailed}: ${uploadError.message}`);
        uploadFailed = true;
        continue;
      }

      const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      const isPrimary = images.length === 0 && uploaded.length === 0;

      const { data: row, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
          sort_order: startOrder + i,
          is_primary: isPrimary,
        })
        .select("id,image_url,sort_order,is_primary")
        .single();

      if (insertError || !row) {
        setMessage(`${t.productImages.saveOneFailed}: ${insertError?.message || t.productImages.unknownError}`);
        uploadFailed = true;
        await supabase.storage.from("product-images").remove([path]);
        continue;
      }

      uploaded.push(row);

      if (isPrimary) {
        await supabase.from("products").update({ image_url: publicUrl }).eq("id", productId);
        onPrimaryUrlChange?.(publicUrl);
      }
    }

    if (uploaded.length > 0) {
      setImages((prev) => [...prev, ...uploaded]);
    }

    if (uploadFailed) {
      toast.error(t.feedback.imageUploadError);
    } else if (uploaded.length > 0) {
      toast.success(t.feedback.imageUploadSuccess);
    }

    setUploading(false);
  }

  function removeStaged(localId: string) {
    setStaged((prev) => {
      const target = prev.find((s) => s.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((s) => s.localId !== localId);
      if (target?.isPrimary && next.length > 0) next[0].isPrimary = true;
      return next;
    });
  }

  function setStagedPrimary(localId: string) {
    setStaged((prev) => prev.map((s) => ({ ...s, isPrimary: s.localId === localId })));
  }

  function moveStaged(localId: string, direction: -1 | 1) {
    setStaged((prev) => {
      const index = prev.findIndex((s) => s.localId === localId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function setExistingPrimary(imageId: string) {
    if (!productId) return;
    const target = images.find((img) => img.id === imageId);
    if (!target || target.is_primary) return;

    setMessage("");
    const { error: resetError } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    const { error: setError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

    if (resetError || setError) {
      const msg = (resetError || setError)?.message || t.feedback.imageUploadError;
      setMessage(msg);
      toast.error(msg);
      return;
    }

    await supabase.from("products").update({ image_url: target.image_url }).eq("id", productId);

    setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    onPrimaryUrlChange?.(target.image_url);
  }

  async function moveExisting(imageId: string, direction: -1 | 1) {
    if (!productId) return;
    const index = images.findIndex((img) => img.id === imageId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= images.length) return;

    const current = images[index];
    const target = images[targetIndex];

    const { error: err1 } = await supabase
      .from("product_images")
      .update({ sort_order: target.sort_order })
      .eq("id", current.id);
    const { error: err2 } = await supabase
      .from("product_images")
      .update({ sort_order: current.sort_order })
      .eq("id", target.id);

    if (err1 || err2) {
      const msg = (err1 || err2)?.message || t.productImages.reorderError;
      setMessage(msg);
      toast.error(msg);
      return;
    }

    setImages((prev) => {
      const next = [...prev];
      next[index] = { ...current, sort_order: target.sort_order };
      next[targetIndex] = { ...target, sort_order: current.sort_order };
      return next.sort((a, b) => a.sort_order - b.sort_order);
    });
  }

  async function deleteExisting(imageId: string) {
    if (!productId) return;
    const target = images.find((img) => img.id === imageId);
    if (!target) return;

    const confirmed = window.confirm(t.productImages.confirmDelete);
    if (!confirmed) return;

    setMessage("");
    const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId);

    if (deleteError) {
      setMessage(deleteError.message);
      toast.error(deleteError.message || t.feedback.imageDeleteError);
      return;
    }

    const path = extractStoragePath(target.image_url);
    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }

    const remaining = images.filter((img) => img.id !== imageId).sort((a, b) => a.sort_order - b.sort_order);

    if (target.is_primary) {
      const nextPrimary = remaining[0] || null;
      if (nextPrimary) {
        await supabase.from("product_images").update({ is_primary: true }).eq("id", nextPrimary.id);
        await supabase.from("products").update({ image_url: nextPrimary.image_url }).eq("id", productId);
        onPrimaryUrlChange?.(nextPrimary.image_url);
        setImages(remaining.map((img, i) => (i === 0 ? { ...img, is_primary: true } : img)));
      } else {
        await supabase.from("products").update({ image_url: null }).eq("id", productId);
        onPrimaryUrlChange?.(null);
        setImages([]);
      }
    } else {
      setImages(remaining);
    }
    toast.success(t.feedback.imageDeleteSuccess);
  }

  useImperativeHandle(ref, () => ({
    hasStaged: () => staged.length > 0,
    async commitStagedImages(newProductId: string, userId: string) {
      if (staged.length === 0) return null;

      const results: { url: string; isPrimary: boolean }[] = [];

      for (let i = 0; i < staged.length; i++) {
        const item = staged[i];
        const extension = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, item.file, { cacheControl: "3600", upsert: false, contentType: item.file.type });

        if (uploadError) {
          setMessage(`${t.productImages.savedButUploadFailed}: ${uploadError.message}`);
          continue;
        }

        const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

        const { error: insertError } = await supabase.from("product_images").insert({
          product_id: newProductId,
          image_url: publicUrl,
          sort_order: i,
          is_primary: item.isPrimary,
        });

        if (insertError) {
          setMessage(`${t.productImages.savedButSaveFailed}: ${insertError.message}`);
          await supabase.storage.from("product-images").remove([path]);
          continue;
        }

        results.push({ url: publicUrl, isPrimary: item.isPrimary });
      }

      const primary = results.find((r) => r.isPrimary) || results[0] || null;
      return primary ? primary.url : null;
    },
  }));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-700">{t.productImages.label}</label>
        {uploading && <span className="text-xs text-zinc-400">{t.productImages.uploading}</span>}
      </div>

      <label className="mb-4 block cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 p-6 text-center">
        <p className="font-medium text-zinc-700">{t.productImages.dropHint}</p>
        <p className="mt-1 text-xs text-zinc-400">{t.productImages.sizeHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </label>

      {message && <p className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{message}</p>}

      {productId ? (
        images.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-400">{t.productImages.noImagesYet}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, index) => (
              <div key={img.id} className="overflow-hidden rounded-2xl border border-zinc-200">
                <div className="relative aspect-square bg-zinc-100">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute end-2 top-2 rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                      {t.productImages.primaryBadge}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => setExistingPrimary(img.id)}
                      className="w-full rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-700"
                    >
                      {t.productImages.setPrimary}
                    </button>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveExisting(img.id, -1)}
                      className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-600 disabled:opacity-30"
                    >
                      {t.productImages.moveForward}
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveExisting(img.id, 1)}
                      className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-600 disabled:opacity-30"
                    >
                      {t.productImages.moveBackward}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteExisting(img.id)}
                    className="w-full rounded-lg border border-red-100 py-1.5 text-xs font-medium text-red-600"
                  >
                    {t.productImages.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : staged.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-400">{t.productImages.noImagesYet}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {staged.map((item, index) => (
            <div key={item.localId} className="overflow-hidden rounded-2xl border border-zinc-200">
              <div className="relative aspect-square bg-zinc-100">
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                {item.isPrimary && (
                  <span className="absolute end-2 top-2 rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                    {t.productImages.primaryBadge}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 p-2">
                {!item.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setStagedPrimary(item.localId)}
                    className="w-full rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-700"
                  >
                    {t.productImages.setPrimary}
                  </button>
                )}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveStaged(item.localId, -1)}
                    className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-600 disabled:opacity-30"
                  >
                    {t.productImages.moveForward}
                  </button>
                  <button
                    type="button"
                    disabled={index === staged.length - 1}
                    onClick={() => moveStaged(item.localId, 1)}
                    className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs text-zinc-600 disabled:opacity-30"
                  >
                    {t.productImages.moveBackward}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeStaged(item.localId)}
                  className="w-full rounded-lg border border-red-100 py-1.5 text-xs font-medium text-red-600"
                >
                  {t.productImages.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductImagesManager;
