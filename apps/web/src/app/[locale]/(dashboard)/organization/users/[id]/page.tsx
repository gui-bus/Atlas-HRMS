"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, Shield } from "@phosphor-icons/react";

import { userAccountService, UserAccount } from "@/services/user-account.service";
import { RbacGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import { Select, Option } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormSectionHeader } from "@/components/form-section-header";
import { useToast } from "@/components/ui/toast";

export default function UserAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const locale = params?.locale || "pt";
  const { toast } = useToast();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-account", id],
    queryFn: () => userAccountService.getUserAccount(id),
    enabled: !!id,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { role: "EMPLOYEE" },
  });

  useEffect(() => {
    if (user) {
      reset({ role: user.role });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: { role: string }) => userAccountService.updateUserAccount(id, data),
    onSuccess: () => {
      toast("Permissões do usuário atualizadas com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ["user-accounts"] });
      router.push(`/${locale}/organization/users`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao atualizar conta.";
      toast(msg, "error");
    },
  });

  const onSubmit = (data: { role: string }) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center w-full">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Erro ao carregar detalhes do usuário.
      </div>
    );
  }

  return (
    <RbacGuard allowedRoles={["ADMIN", "HR"]}>
      <div className="p-6 md:p-8 space-y-6 w-full animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detalhes do Usuário</h1>
            <p className="text-muted-foreground text-sm">
              Visualize as informações da conta e altere o nível de acesso associado.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full max-w-2xl">
          <div className="space-y-4">
            <FormSectionHeader
              title="Informações de Acesso"
              description="Gerencie os níveis de acesso de segurança da conta."
              icon={Shield}
            />

            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="space-y-2">
                <Label>E-mail da Conta</Label>
                <div className="h-10 px-3 flex items-center rounded-2xl bg-muted/30 text-muted-foreground text-sm font-semibold border-0">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso (Papel)</Label>
                <Select id="role" {...register("role")}>
                  <Option value="ADMIN">Administrador</Option>
                  <Option value="HR">Recursos Humanos</Option>
                  <Option value="MANAGER">Gestor</Option>
                  <Option value="EMPLOYEE">Colaborador</Option>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl border-0 bg-muted/40 hover:bg-muted/65 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-2xl border-0 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6"
            >
              {mutation.isPending && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </RbacGuard>
  );
}
